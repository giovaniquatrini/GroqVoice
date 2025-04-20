chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["modal.js"],
    });
  } catch (error) {
    console.error("Erro ao injetar o script:", error);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-recording") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.scripting
          .executeScript({
            target: { tabId: tabs[0].id },
            files: ["modal.js"],
          })
          .then(() => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "toggle-recording",
              fromShortcut: true,
              recording: "toggle",
            });
          });
      }
    });
  }
});
