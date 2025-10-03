// Chrome extension API declaration
declare const chrome: any;

export class SettingsManager {
  private modal: any;
  private settingsModal: any;
  private apiKeyInput: any;
  private saveApiKeyButton: any;
  private settingsMessage: any;
  private closeSettingsButton: any;
  private config: any;
  private onConfigChangeCallback: any;
  private outputElement: any;
  private elements: any;

  constructor(
    modal: any,
    settingsModal: any,
    apiKeyInput: any,
    saveApiKeyButton: any,
    settingsMessage: any,
    closeSettingsButton: any,
    config: any,
    onConfigChangeCallback: any,
    outputElement: any,
    elements: any = null
  ) {
    this.modal = modal;
    this.settingsModal = settingsModal;
    this.apiKeyInput = apiKeyInput;
    this.saveApiKeyButton = saveApiKeyButton;
    this.settingsMessage = settingsMessage;
    this.closeSettingsButton = closeSettingsButton;
    this.config = config;
    this.onConfigChangeCallback = onConfigChangeCallback;
    this.outputElement = outputElement;
    this.elements = elements;

    this.closeSettingsButton.addEventListener("click", () => {
      this.settingsModal.classList.remove("show");
    });

    this.saveApiKeyButton.addEventListener("click", () => {
      this.saveApiKey();
    });

    this.loadConfig();
  }

  saveApiKey() {
    const apiKey = this.apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.local.set({ GROQ_API_KEY: apiKey }, () => {
        this.settingsMessage.style.color = "green";
        this.settingsMessage.innerText = "Chave de API salva com sucesso!";
      });
    } else {
      this.settingsMessage.style.color = "red";
      this.settingsMessage.innerText =
        "Por favor, insira uma chave de API válida.";
    }
  }

  loadConfig() {
    chrome.storage.local.get(["config", "GROQ_API_KEY"], (data: any) => {
      if (data.config) {
        this.config = { ...this.config, ...data.config };
        this.updateTheme();
        this.updateUIFromConfig();
        if (this.onConfigChangeCallback) {
          this.onConfigChangeCallback(this.config);
        }
      }

      if (data.GROQ_API_KEY) {
        this.apiKeyInput.value = data.GROQ_API_KEY;
      } else {
        if (this.outputElement) {
          this.outputElement.innerText = "Por favor, defina sua chave de API.";
        }
      }
    });
  }

  saveConfig(configOverride: any = null) {
    const configToSave = configOverride || this.config;
    this.config = { ...this.config, ...configToSave };

    chrome.storage.local.set({ config: this.config }, () => {
      console.log("GroqVoice: Configuration saved:", this.config);
      if (this.onConfigChangeCallback) {
        this.onConfigChangeCallback(this.config);
      }
    });
  }

  updateTheme(theme: any = null) {
    const currentTheme = theme || this.config.theme;
    if (currentTheme === "dark") {
      this.modal.style.backgroundColor = "#2c2c2c";
      this.modal.style.color = "#fff";
    } else {
      this.modal.style.backgroundColor = "#f9f9f9";
      this.modal.style.color = "#333";
    }
  }

  updateSpectrum(showSpectrum: any = null) {
    const show =
      showSpectrum !== null ? showSpectrum : this.config.showSpectrum;
    if (this.elements && this.elements.canvas) {
      this.elements.canvas.style.display = show ? "block" : "none";
    }
  }

  updateUIFromConfig() {
    if (!this.elements) return;

    // Update checkbox states
    if (this.elements.copyButtonCheckbox) {
      this.elements.copyButtonCheckbox.checked = this.config.showCopyButton;
    }

    if (this.elements.spectrumCheckbox) {
      this.elements.spectrumCheckbox.checked = this.config.showSpectrum;
    }

    if (this.elements.autoCloseCheckbox) {
      this.elements.autoCloseCheckbox.checked = this.config.autoClose;
    }

    if (this.elements.autoSendCheckbox) {
      this.elements.autoSendCheckbox.checked = this.config.autoSend;
    }

    // Update input values
    if (this.elements.truncateInput) {
      this.elements.truncateInput.value = this.config.truncateLength.toString();
    }

    if (this.elements.themeSelect) {
      this.elements.themeSelect.value = this.config.theme;
    }

    // Apply visual updates
    this.updateSpectrum();

    if (this.config.autoClose && this.modal) {
      this.modal.classList.add("auto-close-active");
    } else if (this.modal) {
      this.modal.classList.remove("auto-close-active");
    }
  }
}
