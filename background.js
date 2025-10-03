chrome.action.onClicked.addListener((tab) => {
  // Send a message to the content script to toggle the modal visibility
  chrome.tabs.sendMessage(tab.id, { action: "toggle-modal" });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-recording") {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      // Send a message to the content script to toggle recording
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle-recording" });
    }
  }
});