const openATab = (info) => {
  //Add all you functional Logic here
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    async (tabs) => {
      console.log("abs[0].id", tabs[0].id);
      await chrome.tabs.sendMessage(tabs[0].id, info.selectionText);
    }
  );
};

const callOpenAI = async (text) => {
  sendMessage("generating...");
  const result = await fetch(`https://api.kuiq.io/call-gpt3?text=${text}`).then(
    (res) => res.json()
  );

  console.log({ result });

  sendMessage(result[0].text);
};

const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    chrome.tabs.sendMessage(
      activeTab,
      { message: "inject", content },
      (response) => {
        if (response.status === "failed") {
          console.log("injection failed.");
        }
      }
    );
  });
};

const OPEN_TAB = "open-tab";
const CALL_API = "call-api";

chrome.runtime.onInstalled.addListener(function () {
  // When the app gets installed, set up the context menus
  chrome.contextMenus.create({
    title: "Open Paraphrase AI",
    id: OPEN_TAB,
    visible: true,
    contexts: ["selection"],
    type: "normal",
  });
});

chrome.runtime.onInstalled.addListener(function () {
  // When the app gets installed, set up the context menus
  chrome.contextMenus.create({
    title: "Generate a paraphrased text!",
    id: CALL_API,
    visible: true,
    contexts: ["selection"],
    type: "normal",
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === OPEN_TAB) openATab(info);
  if (info.menuItemId === CALL_API) await callOpenAI(info.selectionText);
});
