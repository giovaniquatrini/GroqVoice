
export class TextManager {
    constructor(output, config) {
        this.output = output;
        this.config = config;
        this.lastFocusedElement = null;

        // Adicionar estilo para highlight
        const highlightStyle = document.createElement("style");
        highlightStyle.textContent = `
            .groqvoice-highlight {
                outline: 2px solid #007bff !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(highlightStyle);

        document.addEventListener("focusin", (event) => {
            this.updateLastFocusedElement(event);
        });
    }

    updateVisualFeedback() {
        // Remover highlight anterior
        const previousHighlight = document.querySelector(".groqvoice-highlight");
        if (previousHighlight) {
            previousHighlight.classList.remove("groqvoice-highlight");
        }

        // Adicionar highlight ao novo elemento focado, se não estiver dentro do shadowHost
        if (this.lastFocusedElement && !this.output.closest('#groq-voice-shadow-host').contains(this.lastFocusedElement)) {
            this.lastFocusedElement.classList.add("groqvoice-highlight");
        }
    }

    truncateText(text) {
        if (this.config.truncateLength > 0 && text.length > this.config.truncateLength) {
            return text.substring(0, this.config.truncateLength) + "...";
        }
        return text;
    }

    createCopyButton(text) {
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
    }

    createRetryButton(audioBlob, retryCallback) {
        const retryButton = document.createElement("button");
        retryButton.innerText = "Tentar Novamente";
        retryButton.className = "retry-button";
        retryButton.addEventListener("click", () => {
            retryCallback(audioBlob);
        });
        return retryButton;
    }

    insertTextIntoField(transcribedText) {
        transcribedText = transcribedText.trimStart();
        const displayText = this.truncateText(transcribedText);

        this.output.innerHTML = "";

        const textDiv = document.createElement("div");
        textDiv.innerText = displayText;
        this.output.appendChild(textDiv);

        if (this.config.showCopyButton) {
            this.output.appendChild(this.createCopyButton(transcribedText));
        }

        if (this.lastFocusedElement) {
            if (
                this.lastFocusedElement.tagName === "INPUT" ||
                this.lastFocusedElement.tagName === "TEXTAREA"
            ) {
                const oldValue = this.lastFocusedElement.value;
                this.lastFocusedElement.value = oldValue + transcribedText;

                this.lastFocusedElement.dispatchEvent(new Event("input", { bubbles: true }));
                this.lastFocusedElement.dispatchEvent(new Event("change", { bubbles: true }));

                // Envio automático se configurado
                if (this.config.autoSend) {
                    setTimeout(() => {
                        const enterEvent = new KeyboardEvent("keydown", {
                            key: "Enter",
                            code: "Enter",
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true,
                        });
                        this.lastFocusedElement.dispatchEvent(enterEvent);

                        const enterEventUp = new KeyboardEvent("keyup", {
                            key: "Enter",
                            code: "Enter",
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true,
                        });
                        this.lastFocusedElement.dispatchEvent(enterEventUp);

                        // Tentar também disparar o evento de submit no formulário pai, se existir
                        const form = this.lastFocusedElement.closest("form");
                        if (form) {
                            form.dispatchEvent(
                                new Event("submit", { bubbles: true, cancelable: true })
                            );
                        }
                    }, 100);
                }
            } else if (this.lastFocusedElement.isContentEditable) {
                this.lastFocusedElement.focus();

                const sel = window.getSelection();
                if (sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    const textNode = document.createTextNode(transcribedText);
                    range.insertNode(textNode);

                    range.setStartAfter(textNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else {
                    this.lastFocusedElement.innerHTML += transcribedText;
                }

                // Envio automático para elementos contentEditable se configurado
                if (this.config.autoSend) {
                    setTimeout(() => {
                        const enterEvent = new KeyboardEvent("keydown", {
                            key: "Enter",
                            code: "Enter",
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true,
                        });
                        this.lastFocusedElement.dispatchEvent(enterEvent);

                        const enterEventUp = new KeyboardEvent("keyup", {
                            key: "Enter",
                            code: "Enter",
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true,
                        });
                        this.lastFocusedElement.dispatchEvent(enterEventUp);
                    }, 100);
                }
            }
        } else {
            textDiv.innerText = `Nenhum campo de texto selecionado.\n\n${displayText}`;
        }
    }

    isValidTextField(element) {
        if (!element) return false;

        const role = element.getAttribute("role");
        if (role === "textbox" || role === "searchbox") return true;

        if (element.tagName === "INPUT") {
            const validTypes = ["text", "search", "email", "url", "tel"];
            return validTypes.includes(element.type);
        }

        if (element.tagName === "TEXTAREA") return true;
        if (element.isContentEditable) return true;

        const isRichTextEditor =
            element.classList.contains("mce-content-body") ||
            element.classList.contains("cke_editable") ||
            element.classList.contains("ql-editor") ||
            element.classList.contains("c92459f0");
        if (isRichTextEditor) return true;

        return false;
    }

    findClosestEditableElement(element) {
        if (!element) return null;
        if (this.isValidTextField(element)) return element;

        let parent = element.parentElement;
        while (parent) {
            if (this.isValidTextField(parent)) return parent;
            parent = parent.parentElement;
        }

        return null;
    }

    updateLastFocusedElement(event) {
        const target = event.target;
        const editableElement = this.findClosestEditableElement(target);

        if (editableElement) {
            this.lastFocusedElement = editableElement;
            this.updateVisualFeedback(); // Chamar feedback visual aqui
        }
    }
}
