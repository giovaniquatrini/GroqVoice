(function () {
  // Verificar se o modal já existe para não adicionar múltiplos
  if (document.getElementById("extension-modal")) {
    return;
  }

  // Variável para armazenar o último campo de texto focado
  let lastFocusedElement = null;

  // Criar o container para o Shadow DOM
  const shadowHost = document.createElement("div");
  shadowHost.id = "extension-modal";

  // Estilos do shadowHost
  // Carregar posição salva ou usar padrão
  const loadSavedPosition = () => {
    const hostname = window.location.hostname;
    chrome.storage.local.get(`position_${hostname}`, (data) => {
      const savedPosition = data[`position_${hostname}`];
      if (savedPosition) {
        shadowHost.style.left = savedPosition.left;
        shadowHost.style.top = savedPosition.top;
      } else {
        // Posição padrão ajustada para evitar sobreposições
        const rect = document.body.getBoundingClientRect();
        shadowHost.style.left = `${rect.width - 250}px`; // 250px = largura do modal + margem
        shadowHost.style.top = `${Math.min(rect.height * 0.1, 100)}px`; // 10% da altura ou máximo 100px
      }
    });
  };

  shadowHost.style.position = "fixed";
  shadowHost.style.zIndex = "10000";
  loadSavedPosition();

  // Anexar o container ao body
  document.body.appendChild(shadowHost);

  // Criar o Shadow Root
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });

  // Ícone SVG do microfone
  const micSVG = document.createElement("button");
  micSVG.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="41" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.625" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
  `;
  micSVG.className = "botao-mic";

  // Ícone SVG da engrenagem (configurações)
  const settingsIcon = document.createElement("button");
  settingsIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a1.65 1.65 0 1 1-2.34 2.34l-.06-.06a1.65 1.65 0 0 0-1.82-.33h-.1a1.65 1.65 0 0 0-1 1.51V20a1.65 1.65 0 0 1-3.3 0v-.1a1.65 1.65 0 0 0-1-1.51h-.08a1.65 1.65 0 0 0-1.82.33l-.06.06a1.65 1.65 0 0 1-2.34-2.34l.06-.06A1.65 1.65 0 0 0 5 15.4v-.08a1.65 1.65 0 0 0-1.51-1H4a1.65 1.65 0 0 1 0-3.3h.1A1.65 1.65 0 0 0 5.6 9.5V9.4a1.65 1.65 0 0 0-.33-1.82l-.06-.06A1.65 1.65 0 0 1 7.55 5.18l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V4a1.65 1.65 0 0 1 3.3 0v.1a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a1.65 1.65 0 1 1 2.34 2.34l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H20a1.65 1.65 0 0 1 0 3.3h-.1a1.65 1.65 0 0 0-1.5 1z"></path></svg>
  `;
  settingsIcon.className = "settings-icon";

  // Spectro de áudio
  const canvas = document.createElement("canvas");
  canvas.className = "audio-spectrum";
  canvas.width = 200;
  canvas.height = 50;

  // Criar o spinner
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.style.display = "none"; // Escondido inicialmente

  // Criar o estilo para o modal dentro do Shadow DOM
  const style = document.createElement("style");
  style.textContent = `
   .modal {
    background-color: #f9f9f9; /* Cor mais suave */
    border: 1px solid #ddd; /* Bordas mais discretas */
    padding: 20px; /* Maior espaçamento para conforto visual */
    width: 200px; /* Largura ligeiramente maior */
    border-radius: 8px; /* Bordas arredondadas para um toque moderno */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); /* Sombra mais suave */
    user-select: none;
    position: relative; /* Necessário para o botão de fechar */
  }

  .modal h4 {
      font-family: "Roboto", "Helvetica", sans-serif;
      margin: 0 0 15px;
      font-size: 18px;
      color: #333;
      display: inline; /* Altera para inline */
      vertical-align: middle; /* Alinha verticalmente com o ícone */
  }

  .audio-spectrum {
    width: 100%;
    height: 30px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }

  .modal button {
    margin-top: 5px;
    padding: 5px 10px; /* Adicionado preenchimento para o botão */
    background-color: #007bff; /* Cor de fundo padrão para o botão */
    color: #fff; /* Texto branco */
    border: none;
    border-radius: 5px; /* Bordas arredondadas no botão */
    cursor: pointer;
    transition: background-color 0.3s ease; /* Transição suave */
  }

  .modal button:hover {
    background-color: #0056b3; /* Cor de fundo ao passar o mouse */
  }

  .copy-button {
    margin-top: 10px !important;
    padding: 5px 15px !important;
    font-size: 14px !important;
    background-color: #28a745 !important;
    color: white !important;
    border: none !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    transition: background-color 0.3s ease !important;
  }

  .copy-button:hover {
    background-color: #218838 !important;
  }

  .close-btn {
    position: absolute;
    top: 7px; /* Ajuste para um pouco abaixo da borda superior */
    right: 12px; /* Ajuste para um pouco à esquerda da borda direita */
    cursor: pointer;
    background: none;
    border: none;
    font-size: 14px;
    color: #888; /* Cor cinza discreta */
    transition: color 0.2s ease;
  }

  input[type="text"] {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    background-color: #fff; /* Força fundo branco */
    color: #333; /* Força cor de texto escura */
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    transition: border-color 0.3s ease;
  }

  input[type="text"]::placeholder {
    color: #888; /* Cor do placeholder */
  }

  input[type="text"]:focus {
    border-color: #007bff;
  }

  .botao-mic {
    cursor: pointer;
    margin-top: 15px !important;
    border-radius: 50% !important;
    transition: transform 0.2s ease;
    display: block; /* Torna o elemento um bloco para controlar alinhamento */
    margin: 0 auto; /* Centraliza horizontalmente */
  }

  .output {
    margin-top: 10px;
    font-size: 14px;
    color: #333;
    white-space: pre-wrap; /* Permite quebras de linha */
  }

  .spinner {
    margin: 10px auto;
    border: 4px solid #f3f3f3; /* Cor de fundo */
    border-top: 4px solid #007bff; /* Cor do spinner */
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }

  /* Novo estilo para o ícone de configurações */
    .settings-icon {
      background: none !important;
      border: none;
      cursor: pointer;
      position: relative;
      display: inline-block;
      margin-left: 8px;
      vertical-align: middle;
    }

    .settings-icon svg {
      width: 24px;
      height: 24px;
      stroke: #888;
      transition: stroke 0.2s ease;
    }

    .settings-icon:hover svg {
      stroke: #333;
    }

    /* Estilos para o modal de configurações */
    .settings-modal {
      display: none; /* Oculto por padrão */
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      padding: 20px;
      width: 200px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      position: absolute;
      top: 50px; /* Ajuste conforme necessário */
      right: 0;
      z-index: 10001;
    }

    .settings-modal.show {
      display: block;
    }

    .settings-modal h4 {
      margin-top: 0;
    }

    .settings-modal button.close-settings {
      position: absolute;
      top: 7px;
      right: 12px;
      background: none;
      border: none;
      font-size: 14px;
      color: #888;
      cursor: pointer;
    }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;

  // Criar o modal principal
  const modal = document.createElement("div");
  modal.className = "modal";

  // Cabeçalho do modal
  const header = document.createElement("h4");
  header.innerText = "GroqVoice";

  // Botão de fechar
  const closeButton = document.createElement("button");
  closeButton.innerText = "✖";
  closeButton.className = "close-btn";
  closeButton.addEventListener("click", () => {
    savePosition();
    document.body.removeChild(shadowHost);
    document.removeEventListener("focusin", updateLastFocusedElement);
  });

  // Criar o modal de configurações
  const settingsModal = document.createElement("div");
  settingsModal.className = "settings-modal";
  // Header para o modal de configurações
  const settingsHeader = document.createElement("h4");
  settingsHeader.innerText = "Chave API";
  // Botão de fechar para o modal de configurações
  const closeSettingsButton = document.createElement("button");
  closeSettingsButton.innerText = "✖";
  closeSettingsButton.className = "close-settings";
  closeSettingsButton.addEventListener("click", () => {
    settingsModal.classList.remove("show");
  });

  // Campo de entrada da chave de API
  const apiKeyLabel = document.createElement("label");
  apiKeyLabel.innerText = "Chave de API:";

  const apiKeyInput = document.createElement("input");
  apiKeyInput.type = "text";
  apiKeyInput.placeholder = "Insira sua chave de API";

  const saveApiKeyButton = document.createElement("button");
  saveApiKeyButton.innerText = "Salvar Chave";

  // Área para mensagens no modal de configurações
  const settingsMessage = document.createElement("div");
  settingsMessage.style.marginTop = "10px";

  // Evento de clique para abrir o modal de configurações
  settingsIcon.addEventListener("click", () => {
    settingsModal.classList.toggle("show");
  });

  // Evento para salvar a chave de API
  saveApiKeyButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      // Armazenar a chave usando chrome.storage
      chrome.storage.local.set({ GROQ_API_KEY: apiKey }, () => {
        settingsMessage.style.color = "green";
        settingsMessage.innerText = "Chave de API salva com sucesso!";
      });
    } else {
      settingsMessage.style.color = "red";
      settingsMessage.innerText = "Por favor, insira uma chave de API válida.";
    }
  });

  // Área para mensagens de saída
  const output = document.createElement("div");
  output.className = "output";

  let gravando = false;
  let mediaRecorder;
  let recordedChunks = [];
  let audioContext;
  let analyser;
  let dataArray;
  let animationId;
  let source;

  // Função para iniciar a gravação
  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Inicializar MediaRecorder com configurações otimizadas
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
          audioBitsPerSecond: 128000, // 128kbps para melhor compressão
        });
        recordedChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        // Configurar para enviar chunks a cada 250ms
        mediaRecorder.start(250);

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
          sendAudioToAPI(audioBlob);
        };

        gravando = true;
        output.innerText = "Gravando...";

        // Inicializar AnalyserNode para o espectro
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Iniciar a animação do espectro
        drawSpectrum();
      })
      .catch((err) => {
        console.error("Error accessing microphone", err);
        output.innerText = "Erro ao acessar o microfone.";
      });
  };

  // Função para parar a gravação
  const stopRecording = () => {
    mediaRecorder.stop();
    gravando = false;
    output.innerText = "Processando...";
    // Mostrar o spinner
    spinner.style.display = "block";

    // Parar a animação do espectro
    cancelAnimationFrame(animationId);
    audioContext.close();
  };

  // Evento de clique no botão do microfone
  micSVG.addEventListener("click", () => {
    if (!gravando) {
      startRecording();
    } else {
      stopRecording();
    }
  });

  // Configurações padrão
  let config = {
    theme: "light",
    showSpectrum: true,
    autoClose: false,
    showCopyButton: true,
    truncateLength: 500, // 0 significa sem limite
  };

  // Função para truncar texto
  const truncateText = (text) => {
    if (config.truncateLength > 0 && text.length > config.truncateLength) {
      return text.substring(0, config.truncateLength) + "...";
    }
    return text;
  };

  // Função para criar botão de copiar
  const createCopyButton = (text) => {
    const copyButton = document.createElement("button");
    copyButton.innerText = "Copiar";
    copyButton.className = "copy-button";
    copyButton.addEventListener("click", () => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          copyButton.innerText = "Copiado!";
          setTimeout(() => {
            copyButton.innerText = "Copiar";
          }, 2000);
        })
        .catch((err) => {
          console.error("Erro ao copiar:", err);
          copyButton.innerText = "Erro";
        });
    });
    return copyButton;
  };

  // Função para carregar as configurações
  const loadConfig = () => {
    chrome.storage.local.get(["config", "GROQ_API_KEY"], (data) => {
      if (data.config) {
        config = { ...config, ...data.config };
        updateTheme();
        updateSpectrum();
        if (config.autoClose) {
          modal.classList.add("auto-close-active");
        }
      }

      if (data.GROQ_API_KEY) {
        GROQ_API_KEY = data.GROQ_API_KEY;
        apiKeyInput.value = GROQ_API_KEY;
      } else {
        output.innerText = "Por favor, defina sua chave de API.";
      }
    });
  };

  // Função para salvar as configurações
  const saveConfig = () => {
    chrome.storage.local.set({ config });
  };

  // Função para atualizar o tema
  const updateTheme = () => {
    if (config.theme === "dark") {
      modal.style.backgroundColor = "#2c2c2c";
      modal.style.color = "#fff";
    } else {
      modal.style.backgroundColor = "#f9f9f9";
      modal.style.color = "#333";
    }
  };

  // Função para atualizar a visibilidade do espectro
  const updateSpectrum = () => {
    canvas.style.display = config.showSpectrum ? "block" : "none";
  };

  // Carregar configurações ao iniciar
  loadConfig();

  // Função para enviar o áudio para a API do Groq
  const sendAudioToAPI = (audioBlob) => {
    // Carregar a chave de API atualizada
    chrome.storage.local.get("GROQ_API_KEY", (data) => {
      GROQ_API_KEY = data.GROQ_API_KEY || "";

      if (!GROQ_API_KEY) {
        output.innerText = "Chave de API não definida.";
        spinner.style.display = "none";
        return;
      }

      const formData = new FormData();
      formData.append("model", "whisper-large-v3-turbo");
      formData.append("file", audioBlob, "audio.webm");
      formData.append("response_format", "verbose_json");

      fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData.error.message);
            });
          }
          return response.json();
        })
        .then((data) => {
          if (data.text) {
            insertTextIntoField(data.text);
          } else {
            output.innerText = "Erro na transcrição do áudio.";
          }
          spinner.style.display = "none";
        })
        .catch((error) => {
          console.error("Error:", error);
          output.innerText = `Erro: ${error.message}`;
          spinner.style.display = "none";
        });
    });
  };

  // Função para inserir o texto no campo selecionado
  const insertTextIntoField = (transcribedText) => {
    // Remover espaços em branco iniciais
    transcribedText = transcribedText.trimStart();

    // Truncar o texto se necessário
    const displayText = truncateText(transcribedText);

    // Limpar o conteúdo anterior do output
    output.innerHTML = "";

    // Criar div para o texto
    const textDiv = document.createElement("div");
    textDiv.innerText = displayText;
    output.appendChild(textDiv);

    // Adicionar botão de copiar se configurado
    if (config.showCopyButton) {
      output.appendChild(createCopyButton(transcribedText));
    }

    if (lastFocusedElement && !shadowHost.contains(lastFocusedElement)) {
      if (
        lastFocusedElement.tagName === "INPUT" ||
        lastFocusedElement.tagName === "TEXTAREA"
      ) {
        // Adicionar o texto ao final do conteúdo existente
        const oldValue = lastFocusedElement.value;
        lastFocusedElement.value = oldValue + transcribedText;

        // Disparar eventos para notificar o DeepSeek da mudança
        lastFocusedElement.dispatchEvent(new Event("input", { bubbles: true }));
        lastFocusedElement.dispatchEvent(
          new Event("change", { bubbles: true })
        );
      } else if (lastFocusedElement.isContentEditable) {
        // Inserir o texto na posição atual do cursor
        lastFocusedElement.focus();

        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const textNode = document.createTextNode(transcribedText);
          range.insertNode(textNode);

          // Mover o cursor para depois do texto inserido
          range.setStartAfter(textNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          // Se não houver seleção, adicionar ao final
          lastFocusedElement.innerHTML += transcribedText;
        }
      } else {
        textDiv.innerText = `Elemento selecionado não é compatível.\n\n${displayText}`;
      }
    } else {
      textDiv.innerText = `Nenhum campo de texto selecionado.\n\n${displayText}`;
    }
  };

  // Função para verificar se um elemento é um campo de texto válido
  const isValidTextField = (element) => {
    if (!element) return false;

    // Verificar atributo role
    const role = element.getAttribute("role");
    if (role === "textbox" || role === "searchbox") return true;

    // Verificar tag e tipo para inputs
    if (element.tagName === "INPUT") {
      const validTypes = ["text", "search", "email", "url", "tel"];
      return validTypes.includes(element.type);
    }

    // Verificar outros tipos de elementos
    if (element.tagName === "TEXTAREA") return true;
    if (element.isContentEditable) return true;

    // Verificar editores rich text conhecidos
    const isRichTextEditor =
      element.classList.contains("mce-content-body") || // TinyMCE
      element.classList.contains("cke_editable") || // CKEditor
      element.classList.contains("ql-editor") || // Quill
      element.classList.contains("c92459f0"); // DeepSeek
    if (isRichTextEditor) return true;

    return false;
  };

  // Função para buscar o elemento editável mais próximo
  const findClosestEditableElement = (element) => {
    if (!element) return null;
    if (isValidTextField(element)) return element;

    // Verificar elementos pai
    let parent = element.parentElement;
    while (parent) {
      if (isValidTextField(parent)) return parent;
      parent = parent.parentElement;
    }

    return null;
  };

  // Listener para atualizar o último campo de texto focado
  const updateLastFocusedElement = (event) => {
    const target = event.target;
    const editableElement = findClosestEditableElement(target);

    if (editableElement) {
      lastFocusedElement = editableElement;
      // Adicionar destaque visual
      updateVisualFeedback();
    }
  };

  // Função para atualizar feedback visual do campo selecionado
  const updateVisualFeedback = () => {
    // Remover highlight anterior
    const previousHighlight = document.querySelector(".groqvoice-highlight");
    if (previousHighlight) {
      previousHighlight.classList.remove("groqvoice-highlight");
    }

    if (lastFocusedElement && !shadowHost.contains(lastFocusedElement)) {
      lastFocusedElement.classList.add("groqvoice-highlight");
    }
  };

  // Adicionar estilo para highlight
  const highlightStyle = document.createElement("style");
  highlightStyle.textContent = `
    .groqvoice-highlight {
      outline: 2px solid #007bff !important;
      outline-offset: 2px !important;
    }
  `;
  document.head.appendChild(highlightStyle);

  // Adicionar listeners
  document.addEventListener("focusin", updateLastFocusedElement);

  // Tentar detectar e adicionar listeners para iframes
  const setupIframeListeners = () => {
    document.querySelectorAll("iframe").forEach((iframe) => {
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.addEventListener("focusin", updateLastFocusedElement);
      } catch (error) {
        console.log(
          "Não foi possível acessar iframe (possível restrição de origem cruzada)"
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
        if (node.tagName === "IFRAME") {
          setTimeout(() => setupIframeListeners(), 100); // Pequeno delay para garantir que o iframe esteja carregado
        }
      });
    });
  });

  iframeObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Tornar o modal arrastável
  // Função para salvar a posição atual
  const savePosition = () => {
    const hostname = window.location.hostname;
    chrome.storage.local.set({
      [`position_${hostname}`]: {
        left: shadowHost.style.left,
        top: shadowHost.style.top,
      },
    });
  };

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const onMouseDown = (e) => {
    const tagName = e.target.tagName.toLowerCase();

    // Evita iniciar o arrasto se o usuário clicar em elementos interativos
    if (["button", "input", "textarea"].includes(tagName)) {
      return;
    }

    isDragging = true;
    offsetX = e.clientX - shadowHost.offsetLeft;
    offsetY = e.clientY - shadowHost.offsetTop;
  };

  const onMouseMove = (e) => {
    if (isDragging) {
      shadowHost.style.left = `${e.clientX - offsetX}px`;
      shadowHost.style.top = `${e.clientY - offsetY}px`;
    }
  };

  const onMouseUp = () => {
    if (isDragging) {
      savePosition();
      isDragging = false;
    }
  };

  modal.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  // Função para desenhar o espectro de áudio baseado na entrada do microfone
  function drawSpectrum() {
    const ctx = canvas.getContext("2d");

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#f9f9f9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2;

        ctx.fillStyle = "#007bff";
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }

  // Container para botão de copiar
  const copyButtonContainer = document.createElement("div");
  copyButtonContainer.style.marginTop = "10px";

  const copyButtonLabel = document.createElement("label");
  copyButtonLabel.innerHTML = `
    <input type="checkbox" ${config.showCopyButton ? "checked" : ""}>
    Mostrar botão de copiar
  `;
  copyButtonLabel.querySelector("input").addEventListener("change", (e) => {
    config.showCopyButton = e.target.checked;
    saveConfig();
  });

  // Container para limite de caracteres
  const truncateContainer = document.createElement("div");
  truncateContainer.style.marginTop = "10px";

  const truncateLabel = document.createElement("label");
  truncateLabel.innerText = "Limite de caracteres (0 = sem limite):";
  truncateLabel.style.display = "block";

  const truncateInput = document.createElement("input");
  truncateInput.type = "number";
  truncateInput.min = "0";
  truncateInput.value = config.truncateLength;
  truncateInput.style.width = "100px";
  truncateInput.style.marginTop = "5px";

  truncateInput.addEventListener("change", (e) => {
    const value = parseInt(e.target.value);
    config.truncateLength = value >= 0 ? value : 0;
    saveConfig();
  });

  // Criar controles de configuração adicionais
  const themeContainer = document.createElement("div");
  themeContainer.style.marginTop = "15px";

  const themeLabel = document.createElement("label");
  settingsModal.appendChild(copyButtonContainer);
  copyButtonContainer.appendChild(copyButtonLabel);
  settingsModal.appendChild(truncateContainer);
  truncateContainer.appendChild(truncateLabel);
  truncateContainer.appendChild(truncateInput);

  themeLabel.innerText = "Tema:";

  const themeSelect = document.createElement("select");
  themeSelect.style.marginLeft = "10px";
  themeSelect.innerHTML = `
    <option value="light">Claro</option>
    <option value="dark">Escuro</option>
  `;
  themeSelect.value = config.theme;
  themeSelect.addEventListener("change", () => {
    config.theme = themeSelect.value;
    updateTheme();
    saveConfig();
  });

  const spectrumContainer = document.createElement("div");
  spectrumContainer.style.marginTop = "10px";

  const spectrumLabel = document.createElement("label");
  spectrumLabel.innerHTML = `
    <input type="checkbox" ${config.showSpectrum ? "checked" : ""}>
    Mostrar espectro de áudio
  `;
  spectrumLabel.querySelector("input").addEventListener("change", (e) => {
    config.showSpectrum = e.target.checked;
    updateSpectrum();
    saveConfig();
  });

  const autoCloseContainer = document.createElement("div");
  autoCloseContainer.style.marginTop = "10px";

  const autoCloseLabel = document.createElement("label");
  autoCloseLabel.innerHTML = `
    <input type="checkbox" ${config.autoClose ? "checked" : ""}>
    Auto-ocultar quando inativo
  `;
  autoCloseLabel.querySelector("input").addEventListener("change", (e) => {
    config.autoClose = e.target.checked;
    if (config.autoClose) {
      modal.classList.add("auto-close-active");
    } else {
      modal.classList.remove("auto-close-active");
    }
    saveConfig();
  });

  // Montar o modal de configurações
  settingsModal.appendChild(closeSettingsButton);
  settingsModal.appendChild(settingsHeader);
  settingsModal.appendChild(apiKeyLabel);
  settingsModal.appendChild(apiKeyInput);
  settingsModal.appendChild(saveApiKeyButton);
  settingsModal.appendChild(settingsMessage);

  // Adicionar novos controles
  themeContainer.appendChild(themeLabel);
  themeContainer.appendChild(themeSelect);
  settingsModal.appendChild(themeContainer);
  settingsModal.appendChild(spectrumContainer);
  spectrumContainer.appendChild(spectrumLabel);
  settingsModal.appendChild(autoCloseContainer);
  autoCloseContainer.appendChild(autoCloseLabel);

  // Montar o modal
  modal.appendChild(closeButton);
  modal.appendChild(header);
  modal.appendChild(settingsIcon);
  modal.appendChild(micSVG);
  modal.appendChild(canvas);
  modal.appendChild(spinner);
  modal.appendChild(output);
  modal.appendChild(settingsModal); // Anexar o modal de configurações ao modal principal

  // Anexar o estilo e o modal ao Shadow Root
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(modal);
})();
