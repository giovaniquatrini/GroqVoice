chrome.action.onClicked.addListener(async (tab) => {
  console.log("Injetando script na guia ativa...");

  try {
    // Injetar o script de conteúdo na guia ativa
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["modal.js"],
    });
    console.log("Script injetado com sucesso.");
  } catch (error) {
    console.error("Erro ao injetar o script:", error);
  }
});
