const MEMORY_PER_TAB = 150;

function updateRamSaved() {
  const sleepingTabs = document.querySelectorAll(".tab-item.sleeping").length;
  const saved = sleepingTabs * MEMORY_PER_TAB;
  document.getElementById("ram-saved").textContent =
    `RAM Saved: ${saved} MB`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const awakeContainer = document.getElementById("awake-tabs");
  const sleepingContainer = document.getElementById("sleeping-tabs");

  awakeContainer.innerHTML = "";
  sleepingContainer.innerHTML = "";

  const tabs = await chrome.tabs.query({});
  const data = await chrome.storage.local.get({ sleepingTabs: [] });
  const sleepingUrls = data.sleepingTabs;

  tabs.forEach(tab => {
    const item = document.createElement("div");
    item.className = "tab-item";

    const isSleeping = sleepingUrls.includes(tab.url);

    if (isSleeping) {
      item.classList.add("sleeping");
      item.innerHTML = `
        <span class="tab-url">${tab.url}</span>
        <span class="sleep-label">💤 Sleeping</span>
      `;
      sleepingContainer.appendChild(item);
    } else {
      item.innerHTML = `
  <span>${tab.title.slice(0, 25)}...</span>
  <button class="snooze-btn" data-id="${tab.id}">Snooze</button>
    `;
      awakeContainer.appendChild(item);
    }
  });

  updateRamSaved();

  document.addEventListener("click", e => {
    if (e.target.classList.contains("snooze-btn")) {
      const id = Number(e.target.dataset.id);
      const url = e.target.dataset.url;

      chrome.runtime.sendMessage({ action: "snooze", tabId: id });

      // Save URL instead of ID
      chrome.storage.local.get({ sleepingTabs: [] }, data => {
        const updated = [...new Set([...data.sleepingTabs, url])];
        chrome.storage.local.set({ sleepingTabs: updated });
      });

      const card = e.target.closest(".tab-item");
      card.classList.add("sleeping");

      e.target.remove();
      card.innerHTML += `<span class="sleep-label">💤 Sleeping</span>`;

      sleepingContainer.appendChild(card);
      updateRamSaved();
    }
  });
});
