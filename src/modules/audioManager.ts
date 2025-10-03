
export class AudioManager {
    constructor(canvas, output, spinner, micSVG) {
        this.canvas = canvas;
        this.output = output;
        this.spinner = spinner;
        this.micSVG = micSVG;
        this.gravando = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.audioContext = null;
        this.analyser = null;
        this.animationId = null;
        this.source = null;
        this.lastAudioBlob = null;
        this.isProcessing = false;

        this.micSVG.addEventListener("click", () => {
            if (!this.gravando) {
                this.startRecording();
            } else {
                this.stopRecording();
            }
        });
    }

    startRecording() {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                this.mediaRecorder = new MediaRecorder(stream, {
                    mimeType: "audio/webm",
                    audioBitsPerSecond: 128000,
                });
                this.recordedChunks = [];

                this.mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        this.recordedChunks.push(e.data);
                    }
                };

                this.mediaRecorder.start(250);

                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.recordedChunks, { type: "audio/webm" });
                    this.sendAudioToAPI(audioBlob);
                };

                this.gravando = true;
                this.output.innerText = "Gravando...";

                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioContext.createAnalyser();
                this.source = this.audioContext.createMediaStreamSource(stream);
                this.source.connect(this.analyser);

                this.analyser.fftSize = 256;
                const bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(bufferLength);

                this.drawSpectrum();
            })
            .catch((err) => {
                console.error("Error accessing microphone", err);
                this.output.innerText = "Erro ao acessar o microfone.";
            });
    }

    stopRecording() {
        this.mediaRecorder.stop();
        this.gravando = false;
        this.output.innerText = "Processando...";
        this.spinner.style.display = "block";

        cancelAnimationFrame(this.animationId);
        this.audioContext.close();
    }

    drawSpectrum() {
        const ctx = this.canvas.getContext("2d");

        const draw = () => {
            this.animationId = requestAnimationFrame(draw);

            this.analyser.getByteFrequencyData(this.dataArray);

            ctx.fillStyle = "#f9f9f9";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < this.dataArray.length; i++) {
                barHeight = this.dataArray[i] / 2;

                ctx.fillStyle = "#007bff";
                ctx.fillRect(x, this.canvas.height - barHeight / 2, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    }

    // This method will be overwritten by the GroqAPI class
    sendAudioToAPI(audioBlob) {
        console.error("sendAudioToAPI method not implemented in AudioManager");
    }
}
