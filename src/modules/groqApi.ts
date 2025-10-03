
export class GroqAPI {
    constructor(output, spinner, textManager) {
        this.output = output;
        this.spinner = spinner;
        this.textManager = textManager;
        this.isProcessing = false;
        this.GROQ_API_KEY = "";
    }

    loadApiKey() {
        return new Promise((resolve) => {
            chrome.storage.local.get("GROQ_API_KEY", (data) => {
                this.GROQ_API_KEY = data.GROQ_API_KEY || "";
                resolve();
            });
        });
    }

    async sendAudioToAPI(audioBlob) {
        if (this.isProcessing) {
            console.log("Já está processando áudio, evitando duplicação");
            return;
        }

        this.isProcessing = true;
        this.spinner.style.display = "block";

        await this.loadApiKey();

        if (!this.GROQ_API_KEY) {
            this.output.innerText = "Chave de API não definida.";
            this.spinner.style.display = "none";
            this.isProcessing = false;
            return;
        }

        const formData = new FormData();
        formData.append("model", "whisper-large-v3-turbo");
        formData.append("file", audioBlob, "audio.webm");
        formData.append("response_format", "verbose_json");

        fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.GROQ_API_KEY}`,
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
                    this.textManager.insertTextIntoField(data.text);
                } else {
                    this.output.innerText = "Erro na transcrição do áudio.";
                }
                this.spinner.style.display = "none";
                this.isProcessing = false;
            })
            .catch((error) => {
                console.error("Error:", error);

                this.output.innerHTML = "";

                const errorDiv = document.createElement("div");
                errorDiv.innerText = `Erro: ${error.message}`;
                errorDiv.style.color = "#d32f2f";
                errorDiv.style.marginBottom = "10px";
                this.output.appendChild(errorDiv);

                // Adicionar botão de retry
                this.output.appendChild(this.textManager.createRetryButton(audioBlob, (blob) => this.sendAudioToAPI(blob)));

                this.spinner.style.display = "none";
                this.isProcessing = false;
            });
    }
}
