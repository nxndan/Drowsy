document.addEventListener("DOMContentLoaded", async () => {
  const awakeContainer = document.getElementById("awake-tabs");
  const sleepingContainer = document.getElementById("sleeping-tabs");

  awakeContainer.innerHTML = "";
  sleepingContainer.innerHTML = "";

  const tabs = await chrome.tabs.query({});

  tabs.forEach(tab => {
    const item = document.createElement("div");
    item.className = "tab-item";

    item.innerHTML = `
      <span>${tab.title.slice(0, 25)}...</span>
      <button class="snooze-btn" data-id="${tab.id}">Snooze</button>
    `;

    awakeContainer.appendChild(item);
  });

  document.addEventListener("click", e => {
    if (e.target.classList.contains("snooze-btn")) {
      const id = Number(e.target.dataset.id);
      chrome.runtime.sendMessage({ action: "snooze", tabId: id });

      // Change button to Done
      e.target.textContent = "Done";
      e.target.disabled = true;

      // Move card to sleeping section
      const card = e.target.closest(".tab-item");
      card.classList.add("sleeping");

      // Remove button and add label
      e.target.remove();
      card.innerHTML += `<span class="sleep-label">💤 Sleeping</span>`;

      sleepingContainer.appendChild(card);
    }
  });
});
