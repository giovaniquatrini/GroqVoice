// Chrome extension API declaration
declare const chrome: any;

console.log("GroqVoice: main.ts script started.");

import { modalStyles } from "./styles";
import { createModalElements } from "./domElements";
import { AudioManager } from "./audioManager";
import { GroqAPI } from "./groqApi";
import { TextManager } from "./textManager";
import { DragDropManager } from "./dragDropManager";
import { SettingsManager } from "./settings";

// --- Main App Setup ---

// 1. Create the Shadow Host and attach it to the <html> element
const shadowHost = document.createElement("div");
shadowHost.id = "groq-voice-shadow-host";
shadowHost.style.cssText = `
    position: fixed !important;
    z-index: 2147483647 !important;
    display: none; /* Start hidden */
`;
document.documentElement.appendChild(shadowHost);

// 2. Create the Shadow Root
const shadowRoot = shadowHost.attachShadow({ mode: "open" });

// 3. Inject Styles
const style = document.createElement("style");
style.textContent = modalStyles;
shadowRoot.appendChild(style);

// 4. Create UI Elements
const elements = createModalElements();

// 5. Create the full-screen overlay inside the Shadow DOM
const overlay = document.createElement("div");
overlay.className = "modal-overlay";
shadowRoot.appendChild(overlay);

// 6. Initialize Managers
const config = {
  theme: "light",
  showSpectrum: true,
  autoClose: false,
  showCopyButton: true,
  truncateLength: 500,
  autoSend: false,
};

// Criar uma função para atualizar as configurações do textManager
const updateTextManagerConfig = (newConfig: any) => {
  // Atualizar as propriedades do config do textManager
  Object.assign((textManager as any).config, newConfig);
};

const textManager = new TextManager(elements.output, config);
const audioManager = new AudioManager(
  elements.canvas,
  elements.output,
  elements.spinner,
  elements.micSVG
);
const groqAPI = new GroqAPI(elements.output, elements.spinner, textManager);
const settingsManager = new SettingsManager(
  elements.modal,
  elements.settingsModal,
  elements.apiKeyInput,
  elements.saveApiKeyButton,
  elements.settingsMessage,
  elements.closeSettingsButton,
  config,
  updateTextManagerConfig, // Passar a função de callback para atualizar o textManager
  elements.output,
  elements
);
const dragDropManager = new DragDropManager(elements.modal, shadowHost); // DragDropManager still moves shadowHost

// 7. Connect Managers
audioManager.sendAudioToAPI = (audioBlob) => groqAPI.sendAudioToAPI(audioBlob);

// 8. Assemble the Modal content and append to the overlay
overlay.appendChild(elements.modal);

elements.modal.appendChild(elements.closeButton);
elements.modal.appendChild(elements.header);
elements.modal.appendChild(elements.settingsIcon);
elements.modal.appendChild(elements.micSVG);
elements.modal.appendChild(elements.canvas);
elements.modal.appendChild(elements.spinner);
elements.modal.appendChild(elements.output);
elements.modal.appendChild(elements.settingsModal);

// Assemble the settings sub-modal
elements.settingsModal.appendChild(elements.closeSettingsButton);
elements.settingsModal.appendChild(elements.settingsHeader);
elements.settingsModal.appendChild(elements.apiKeyLabel);
elements.settingsModal.appendChild(elements.apiKeyInput);
elements.settingsModal.appendChild(elements.saveApiKeyButton);
elements.settingsModal.appendChild(elements.settingsMessage);

// Adicionar novos controles de configuração
elements.copyButtonLabel
  .querySelector("input")
  ?.addEventListener("change", (e) => {
    config.showCopyButton = (e.target as HTMLInputElement).checked;
    settingsManager.saveConfig();
  });
elements.copyButtonContainer.appendChild(elements.copyButtonLabel);
elements.settingsModal.appendChild(elements.copyButtonContainer);

elements.truncateInput.addEventListener("change", (e) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  config.truncateLength = value >= 0 ? value : 0;
  settingsManager.saveConfig();
});
elements.truncateContainer.appendChild(elements.truncateLabel);
elements.truncateContainer.appendChild(elements.truncateInput);
elements.settingsModal.appendChild(elements.truncateContainer);

elements.themeSelect.addEventListener("change", (e) => {
  config.theme = (e.target as HTMLSelectElement).value;
  settingsManager.updateTheme();
  settingsManager.saveConfig();
});
elements.themeContainer.appendChild(elements.themeLabel);
elements.themeContainer.appendChild(elements.themeSelect);
elements.settingsModal.appendChild(elements.themeContainer);

elements.spectrumCheckbox.addEventListener("change", (e) => {
  config.showSpectrum = (e.target as HTMLInputElement).checked;
  settingsManager.updateSpectrum();
  settingsManager.saveConfig();
});
elements.spectrumLabel.prepend(elements.spectrumCheckbox);
elements.spectrumContainer.appendChild(elements.spectrumLabel);
elements.settingsModal.appendChild(elements.spectrumContainer);

elements.autoCloseCheckbox.addEventListener("change", (e) => {
  config.autoClose = (e.target as HTMLInputElement).checked;
  if (config.autoClose) {
    elements.modal.classList.add("auto-close-active");
  } else {
    elements.modal.classList.remove("auto-close-active");
  }
  settingsManager.saveConfig();
});
elements.autoCloseLabel.prepend(elements.autoCloseCheckbox);
elements.autoCloseContainer.appendChild(elements.autoCloseLabel);
elements.settingsModal.appendChild(elements.autoCloseContainer);

elements.autoSendCheckbox.addEventListener("change", (e) => {
  config.autoSend = (e.target as HTMLInputElement).checked;
  settingsManager.saveConfig();
});
elements.autoSendLabel.prepend(elements.autoSendCheckbox);
elements.autoSendContainer.appendChild(elements.autoSendLabel);
elements.settingsModal.appendChild(elements.autoSendContainer);
elements.settingsModal.style.zIndex = "2147483647";

// --- Event Listeners ---

function showModal() {
  shadowHost.style.display = "block"; // shadowHost is now just a container, not the overlay
  dragDropManager.loadSavedPosition();
}

function hideModal() {
  shadowHost.style.display = "none";
  dragDropManager.savePosition();
}

elements.closeButton.addEventListener("click", hideModal);

elements.settingsIcon.addEventListener("click", () => {
  console.log("GroqVoice: Settings icon clicked.");
  console.log(
    "GroqVoice: Before toggle - settingsModal display:",
    elements.settingsModal.style.display,
    "classList:",
    elements.settingsModal.classList.contains("show")
  );
  elements.settingsModal.classList.toggle("show");
  console.log(
    "GroqVoice: After toggle - settingsModal display:",
    elements.settingsModal.style.display,
    "classList:",
    elements.settingsModal.classList.contains("show")
  );
});

// Tentar detectar e adicionar listeners para iframes
const setupIframeListeners = () => {
  document.querySelectorAll("iframe").forEach((iframe) => {
    try {
      const iframeDoc =
        iframe.contentDocument ||
        (iframe as HTMLIFrameElement).contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.addEventListener("focusin", (event: any) =>
          textManager.updateLastFocusedElement(event)
        );
      }
    } catch (error) {
      console.log(
        "Não foi possível acessar iframe (possível restrição de origem cruzada)",
        error
      );
    }
  });
};

// Adicionar listeners iniciais para iframes
setupIframeListeners();

// Observar novos iframes adicionados dinamicamente
const iframeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if ((node as Element).tagName === "IFRAME") {
        setTimeout(() => setupIframeListeners(), 100); // Pequeno delay para garantir que o iframe esteja carregado
      }
    });
  });
});

iframeObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

console.log("GroqVoice: Setting up message listener.");
// Listen for messages from the background script
chrome.runtime.onMessage.addListener(
  (message: any, sender: any, sendResponse: any) => {
    console.log("GroqVoice: Message received in content script:", message);
    if (
      message.action === "toggle-modal" ||
      message.action === "toggle-recording"
    ) {
      if (shadowHost.style.display === "none") {
        showModal();
      }
      // Always simulate a click on the mic button for toggle-recording
      if (message.action === "toggle-recording") {
        elements.micSVG.click();
      }
    }
  }
);
