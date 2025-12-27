chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "snooze") {
    const tabId = msg.tabId;

    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        console.warn("Tab no longer exists:", tabId);
        return;
      }

      const url = tab.url;

      chrome.tabs.update(tabId, { autoDiscardable: true }, () => {

        chrome.tabs.discard(tabId, () => {
          if (chrome.runtime.lastError) {
            console.warn("Discard failed:", chrome.runtime.lastError.message);
          } else {
            console.log("Tab successfully discarded:", tabId);
          }
        });

        chrome.storage.local.get({ sleepingTabs: [] }, data => {
          const updated = [...new Set([...data.sleepingTabs, url])];
          chrome.storage.local.set({ sleepingTabs: updated });
        });

      });
    });
  }
});

// ⭐ Detect when a tab wakes up and remove it from sleeping list
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" || changeInfo.status === "complete") {
    const url = tab.url;

    chrome.storage.local.get({ sleepingTabs: [] }, data => {
      if (data.sleepingTabs.includes(url)) {
        const updated = data.sleepingTabs.filter(u => u !== url);
        chrome.storage.local.set({ sleepingTabs: updated });
        console.log("Tab woke up, removed from sleeping:", url);
      }
    });
  }
});
