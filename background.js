chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Verificar se o modal já existe antes de injetar
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!document.getElementById("extension-modal"),
    });

    if (!results[0].result) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["modal.js"],
      });
    } else {
      // Se já existe, apenas mostrar/focar no modal
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const modal = document.getElementById("extension-modal");
          if (modal) {
            modal.style.display = "block";
          }
        },
      });
    }
  } catch (error) {
    console.error("Erro ao injetar o script:", error);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-recording") {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      try {
        // Verificar se o modal já existe
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => !!document.getElementById("extension-modal"),
        });

        if (!results[0].result) {
          // Injetar o script se não existir
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["modal.js"],
          });
          // Aguardar um pouco para o modal ser criado
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "toggle-recording",
              fromShortcut: true,
              recording: "toggle",
            });
          }, 100);
        } else {
          // Modal já existe, apenas enviar comando
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "toggle-recording",
            fromShortcut: true,
            recording: "toggle",
          });
        }
      } catch (error) {
        console.error("Erro ao executar comando:", error);
      }
    }
  }
});
