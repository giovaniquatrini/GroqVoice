export function createModalElements() {
    const micSVG = document.createElement("button");
    micSVG.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="41" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.625" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
    `;
    micSVG.className = "botao-mic";

    const settingsIcon = document.createElement("button");
    settingsIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a1.65 1.65 0 1 1-2.34 2.34l-.06-.06a1.65 1.65 0 0 0-1.82-.33h-.1a1.65 1.65 0 0 0-1 1.51V20a1.65 1.65 0 0 1-3.3 0v-.1a1.65 1.65 0 0 0-1-1.51h-.08a1.65 1.65 0 0 0-1.82.33l-.06.06a1.65 1.65 0 0 1-2.34-2.34l.06-.06A1.65 1.65 0 0 0 5 15.4v-.08a1.65 1.65 0 0 0-1.51-1H4a1.65 1.65 0 0 1 0-3.3h.1A1.65 1.65 0 0 0 5.6 9.5V9.4a1.65 1.65 0 0 0-.33-1.82l-.06-.06A1.65 1.65 0 0 1 7.55 5.18l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V4a1.65 1.65 0 0 1 3.3 0v.1a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a1.65 1.65 0 1 1 2.34 2.34l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H20a1.65 1.65 0 0 1 0 3.3h-.1a1.65 1.65 0 0 0-1.5 1z"></path></svg>
    `;
    settingsIcon.className = "settings-icon";

    const canvas = document.createElement("canvas");
    canvas.className = "audio-spectrum";
    canvas.width = 200;
    canvas.height = 50;

    const spinner = document.createElement("div");
    spinner.className = "spinner";
    spinner.style.display = "none";

    const modal = document.createElement("div");
    modal.className = "modal";

    const header = document.createElement("h4");
    header.innerText = "GroqVoice";

    const closeButton = document.createElement("button");
    closeButton.innerText = "✖";
    closeButton.className = "close-btn";

    const settingsModal = document.createElement("div");
    settingsModal.className = "settings-modal";

    const settingsHeader = document.createElement("h4");
    settingsHeader.innerText = "Chave API";

    const closeSettingsButton = document.createElement("button");
    closeSettingsButton.innerText = "✖";
    closeSettingsButton.className = "close-settings";

    const apiKeyLabel = document.createElement("label");
    apiKeyLabel.innerText = "Chave de API:";

    const apiKeyInput = document.createElement("input");
    apiKeyInput.type = "text";
    apiKeyInput.placeholder = "Insira sua chave de API";

    const saveApiKeyButton = document.createElement("button");
    saveApiKeyButton.innerText = "Salvar Chave";

    const settingsMessage = document.createElement("div");
    settingsMessage.style.marginTop = "10px";

    const output = document.createElement("div");
    output.className = "output";

    // New elements for settings
    const copyButtonContainer = document.createElement("div");
    copyButtonContainer.style.marginTop = "10px";
    const copyButtonLabel = document.createElement("label");
    const copyButtonCheckbox = document.createElement("input");
    copyButtonCheckbox.type = "checkbox";
    copyButtonLabel.appendChild(copyButtonCheckbox);
    copyButtonLabel.append("Mostrar botão de copiar");

    const truncateContainer = document.createElement("div");
    truncateContainer.style.marginTop = "10px";
    const truncateLabel = document.createElement("label");
    truncateLabel.innerText = "Limite de caracteres (0 = sem limite):";
    truncateLabel.style.display = "block";
    const truncateInput = document.createElement("input");
    truncateInput.type = "number";
    truncateInput.min = "0";
    truncateInput.style.width = "100px";
    truncateInput.style.marginTop = "5px";

    const themeContainer = document.createElement("div");
    themeContainer.style.marginTop = "15px";
    const themeLabel = document.createElement("label");
    themeLabel.innerText = "Tema:";
    const themeSelect = document.createElement("select");
    themeSelect.style.marginLeft = "10px";
    themeSelect.innerHTML = `
      <option value="light">Claro</option>
      <option value="dark">Escuro</option>
    `;

    const spectrumContainer = document.createElement("div");
    spectrumContainer.style.marginTop = "10px";
    const spectrumLabel = document.createElement("label");
    const spectrumCheckbox = document.createElement("input");
    spectrumCheckbox.type = "checkbox";
    spectrumLabel.appendChild(spectrumCheckbox);
    spectrumLabel.append("Mostrar espectro de áudio");

    const autoCloseContainer = document.createElement("div");
    autoCloseContainer.style.marginTop = "10px";
    const autoCloseLabel = document.createElement("label");
    const autoCloseCheckbox = document.createElement("input");
    autoCloseCheckbox.type = "checkbox";
    autoCloseLabel.appendChild(autoCloseCheckbox);
    autoCloseLabel.append("Auto-ocultar quando inativo");

    const autoSendContainer = document.createElement("div");
    autoSendContainer.style.marginTop = "10px";
    const autoSendLabel = document.createElement("label");
    const autoSendCheckbox = document.createElement("input");
    autoSendCheckbox.type = "checkbox";
    autoSendLabel.appendChild(autoSendCheckbox);
    autoSendLabel.append("Envio automático após transcrição");

    return {
        micSVG,
        settingsIcon,
        canvas,
        spinner,
        modal,
        header,
        closeButton,
        settingsModal,
        settingsHeader,
        closeSettingsButton,
        apiKeyLabel,
        apiKeyInput,
        saveApiKeyButton,
        settingsMessage,
        output,
        // New elements
        copyButtonContainer,
        copyButtonLabel,
        copyButtonCheckbox,
        truncateContainer,
        truncateLabel,
        truncateInput,
        themeContainer,
        themeLabel,
        themeSelect,
        spectrumContainer,
        spectrumLabel,
        spectrumCheckbox,
        autoCloseContainer,
        autoCloseLabel,
        autoCloseCheckbox,
        autoSendContainer,
        autoSendLabel,
        autoSendCheckbox,
    };
}