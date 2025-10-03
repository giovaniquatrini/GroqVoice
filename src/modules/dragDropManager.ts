export class DragDropManager {
    constructor(modal, shadowHost) {
        this.modal = modal;
        this.shadowHost = shadowHost;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.modal.addEventListener("mousedown", (e) => this.onMouseDown(e));
        document.addEventListener("mousemove", (e) => this.onMouseMove(e));
        document.addEventListener("mouseup", () => this.onMouseUp());
    }

    onMouseDown(e) {
        const tagName = e.target.tagName.toLowerCase();

        if (["button", "input", "textarea"].includes(tagName)) {
            return;
        }

        this.isDragging = true;
        this.offsetX = e.clientX - this.shadowHost.offsetLeft;
        this.offsetY = e.clientY - this.shadowHost.offsetTop;
    }

    onMouseMove(e) {
        if (this.isDragging) {
            this.shadowHost.style.left = `${e.clientX - this.offsetX}px`;
            this.shadowHost.style.top = `${e.clientY - this.offsetY}px`;
        }
    }

    onMouseUp() {
        if (this.isDragging) {
            this.savePosition();
            this.isDragging = false;
        }
    }

    savePosition() {
        const hostname = window.location.hostname;
        chrome.storage.local.set({
            [`position_${hostname}`]: {
                left: this.shadowHost.style.left,
                top: this.shadowHost.style.top,
            },
        });
    }

    loadSavedPosition() {
        return new Promise((resolve) => {
            const hostname = window.location.hostname;
            chrome.storage.local.get(`position_${hostname}`, (data) => {
                const savedPosition = data[`position_${hostname}`];
                if (savedPosition) {
                    this.shadowHost.style.left = savedPosition.left;
                    this.shadowHost.style.top = savedPosition.top;
                } else {
                    const rect = document.body.getBoundingClientRect();
                    this.shadowHost.style.left = `${rect.width - 250}px`;
                    this.shadowHost.style.top = `${Math.min(rect.height * 0.1, 100)}px`;
                }
                resolve();
            });
        });
    }
}