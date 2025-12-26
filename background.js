chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "snooze") {
    const tabId = msg.tabId;

    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        console.warn("Tab no longer exists:", tabId);
        return;
      }

      // 1. Inject favicon BEFORE discarding
      chrome.scripting.executeScript({
        target: { tabId },
        func: injectPotatoFavicon
      }, () => {

        if (chrome.runtime.lastError) {
          console.warn("Injection failed:", chrome.runtime.lastError.message);
          return;
        }

        // 2. Wait 150ms so the DOM can update
        setTimeout(() => {
          chrome.tabs.discard(tabId);
        }, 150);
      });
    });
  }
});


// Runs inside the tab BEFORE it sleeps
function injectPotatoFavicon() {
  // Remove existing icons
  const oldIcons = document.querySelectorAll("link[rel~='icon']");
  oldIcons.forEach(icon => icon.remove());

  // Add potato icon
  const newIcon = document.createElement("link");
  newIcon.rel = "icon";
  newIcon.href = chrome.runtime.getURL("icons/potato.png");
  document.head.appendChild(newIcon);

  // Add sleeping title
  if (!document.title.includes("Sleeping")) {
    document.title = "🥔 Sleeping — " + document.title;
  }
}
