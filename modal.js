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
  shadowHost.style.position = "fixed";
  shadowHost.style.top = "10%";
  shadowHost.style.right = "10%";
  shadowHost.style.zIndex = "10000";

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

  // Spectro de áudio
  const canvas = document.createElement("canvas");
  canvas.className = "audio-spectrum";
  canvas.width = 200;
  canvas.height = 100;

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
    font-family: "Roboto", "Helvetica", sans-serif; /* Fonte mais moderna */
    margin: 0 0 15px;
    font-size: 18px; /* Tamanho de fonte maior */
    color: #333; /* Cor de texto mais escura */
  }

  .audio-spectrum {
    width: 100%;
    height: 100px;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin-top: 10px;
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
    padding-top: 10px;
    border-radius: 50% !important;
    transition: transform 0.2s ease;
    display: block; /* Torna o elemento um bloco para controlar alinhamento */
    margin: 0 auto; /* Centraliza horizontalmente */
  }

  .output {
    margin-top: 10px;
    font-size: 14px;
    color: #333;
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

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;

  // Criar o modal
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
    document.body.removeChild(shadowHost);
    document.removeEventListener("focusin", updateLastFocusedElement);
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
        // Inicializar MediaRecorder
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
          sendAudioToAPI(audioBlob);
        };

        mediaRecorder.start();
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

  // Função para enviar o áudio para a API do Groq
  const sendAudioToAPI = (audioBlob) => {
    const GROQ_API_KEY =
      "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"; // Substitua pela sua chave de API

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
      .then((response) => response.json())
      .then((data) => {
        // Esconder o spinner
        spinner.style.display = "none";

        if (data.text) {
          insertTextIntoField(data.text);
        } else {
          output.innerText = "Erro na transcrição do áudio.";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        output.innerText = "Erro ao enviar o áudio para a API.";
        // Esconder o spinner em caso de erro
        spinner.style.display = "none";
      });
  };

  // Função para inserir o texto no campo selecionado
  const insertTextIntoField = (transcribedText) => {
    if (lastFocusedElement && !shadowHost.contains(lastFocusedElement)) {
      if (
        lastFocusedElement.tagName === "INPUT" ||
        lastFocusedElement.tagName === "TEXTAREA"
      ) {
        lastFocusedElement.value = transcribedText;
        output.innerText = "Texto inserido no campo selecionado.";
      } else if (lastFocusedElement.isContentEditable) {
        lastFocusedElement.focus();
        const range = document.createRange();
        range.selectNodeContents(lastFocusedElement);
        range.deleteContents();
        const textNode = document.createTextNode(transcribedText);
        range.insertNode(textNode);
        output.innerText = "Texto inserido no campo selecionado.";
      } else {
        output.innerText = "Elemento selecionado não é compatível.";
      }
    } else {
      output.innerText = "Nenhum campo de texto selecionado.";
    }
  };

  // Listener para atualizar o último campo de texto focado
  const updateLastFocusedElement = (event) => {
    const target = event.target;

    if (
      (target.tagName === "INPUT" && target.type === "text") ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      lastFocusedElement = target;
    }
  };

  // Adicionar o listener ao documento
  document.addEventListener("focusin", updateLastFocusedElement);

  // Tornar o modal arrastável
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
    isDragging = false;
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

  // Montar o modal
  modal.appendChild(closeButton);
  modal.appendChild(header);
  modal.appendChild(micSVG);
  modal.appendChild(canvas);
  modal.appendChild(spinner);
  modal.appendChild(output);

  // Anexar o estilo e o modal ao Shadow Root
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(modal);
})();
