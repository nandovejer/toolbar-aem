const input = document.getElementById("domainInput");
const addBtn = document.getElementById("addDomain");
const list = document.getElementById("domainList");

async function loadDomains() {
  const { aemDomains = [] } = await chrome.storage.sync.get("aemDomains");
  renderList(aemDomains);
}

function renderList(domains) {
  list.innerHTML = "";
  domains.forEach((domain, index) => {
    const li = document.createElement("li");
    li.textContent = domain + " ";
    const del = document.createElement("button");
    del.textContent = "✕";
    del.onclick = async () => {
      const newList = domains.filter((_, i) => i !== index);
      await chrome.storage.sync.set({ aemDomains: newList });
      loadDomains();
    };
    li.appendChild(del);
    list.appendChild(li);
  });
}

addBtn.onclick = async () => {
  const url = input.value.trim();
  if (!url) return;
  const { aemDomains = [] } = await chrome.storage.sync.get("aemDomains");
  if (!aemDomains.includes(url)) {
    aemDomains.push(url);
    await chrome.storage.sync.set({ aemDomains });
  }
  input.value = "";
  loadDomains();
};

loadDomains();
