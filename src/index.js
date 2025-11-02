// ------------------ Constants ------------------

const ICON = {
  less: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
           <path d="M2.732 12c0-.98.92-1.768 2.06-1.768h14.416c1.14 0 2.06.789 2.06 1.768 0 .98-.92 1.768-2.06 1.768H4.792c-1.14 0-2.06-.789-2.06-1.768z"/>
         </svg>`,
  plus: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 2.732c.98 0 1.768.92 1.768 2.06v14.416c0 1.14-.789 2.06-1.768 2.06-.98 0-1.768-.92-1.768-2.06V4.792c0-1.14.789-2.06 1.768-2.06z"/>
           <path d="M2.732 12c0-.98.92-1.768 2.06-1.768h14.416c1.14 0 2.06.789 2.06 1.768 0 .98-.92 1.768-2.06 1.768H4.792c-1.14 0-2.06-.789-2.06-1.768z"/>
         </svg>`,
};

const BUTTONS = [
  { label: "Edit", action: goToEditor, id: "btn-edit" },
  { label: "View", action: goToContent, id: "btn-view" },
  { label: "Sites", action: goToSites, id: "btn-sites" },
  { label: "CRX", action: goToCrx, id: "btn-crx" },
];

// ------------------ Initialization ------------------

function initToolbar() {
  if (document.querySelector(".aem-toolbar")) return; // avoid duplicates

  const toolbar = document.createElement("div");
  toolbar.className = "aem-toolbar";

  // --- Toggle button (+ / -)
  const toggle = document.createElement("button");
  toggle.className = "aem-toolbar-toggle";
  toggle.innerHTML = ICON.less;
  toggle.title = "Hide toolbar";
  toggle.onclick = () => toggleToolbar(toolbar, toggle);
  toolbar.appendChild(toggle);

  // --- Button group container
  const group = document.createElement("div");
  group.className = "aem-toolbar-group";

  for (const { label, action, id } of BUTTONS) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.className = "aem-toolbar-btn";
    btn.id = id;
    btn.onclick = action;
    group.appendChild(btn);
  }

  toolbar.appendChild(group);
  document.body.appendChild(toolbar);

  updateActiveButton();
}

// ------------------ Toolbar Toggle ------------------

function toggleToolbar(toolbar, toggle) {
  const isCollapsed = toolbar.classList.toggle("collapsed");
  const group = toolbar.querySelector(".aem-toolbar-group");

  if (isCollapsed) {
    toggle.innerHTML = ICON.plus;
    toggle.title = "Show toolbar";
    group.classList.add("hidden");
  } else {
    toggle.innerHTML = ICON.less;
    toggle.title = "Hide toolbar";
    group.classList.remove("hidden");
  }
}

// ------------------ Context Detection ------------------

function getCurrentMode() {
  const href = window.location.href;
  if (href.includes("/editor.html")) return "edit";
  if (href.includes("/sites.html")) return "sites";
  if (href.includes("/crx/de/")) return "crx";
  if (href.includes("/content/")) return "view";
  return "unknown";
}

function updateActiveButton() {
  const mode = getCurrentMode();
  document
    .querySelectorAll(".aem-toolbar-btn")
    .forEach((btn) => (btn.disabled = false));

  switch (mode) {
    case "edit":
      disableButton("btn-edit");
      break;
    case "view":
      disableButton("btn-view");
      break;
    case "sites":
      disableButton("btn-sites");
      break;
    case "crx":
      disableButton("btn-crx");
      break;
  }
}

function disableButton(id) {
  const btn = document.getElementById(id);
  if (btn) btn.disabled = true;
}

// ------------------ Navigation ------------------

function getContentPath() {
  let path = window.location.pathname;

  // ✅ Handle CRXDE (hash-based path)
  if (
    path.startsWith("/crx/de") &&
    window.location.hash.startsWith("#/content/")
  ) {
    path = window.location.hash.substring(1); // removes the "#" prefix
  }

  if (path.startsWith("/editor.html")) return path.replace("/editor.html", "");
  if (path.startsWith("/sites.html")) return path.replace("/sites.html", "");
  return path;
}

function goToEditor() {
  let path = getContentPath();

  // ✅ Make sure it starts with /content/
  if (!path.startsWith("/content/")) {
    path = `/content${path}`;
  }

  // ✅ Ensure .html at the end
  if (!path.endsWith(".html")) {
    path += ".html";
  }

  window.location.href = `/editor.html${path}`;
}

function goToContent() {
  let path = getContentPath();

  // ✅ Make sure it starts with /content/
  if (!path.startsWith("/content/")) {
    path = `/content${path}`;
  }

  // ✅ Add .html extension if missing
  if (!path.endsWith(".html")) {
    path += ".html";
  }

  window.location.href = path;
}

function goToSites() {
  let path = getContentPath();

  // ✅ Keep /content but remove .html
  path = path.replace(/\.html$/, "");

  // ✅ Clean double slashes
  path = path.replace(/\/+/g, "/");

  const finalUrl = `/sites.html${path}`;
  window.location.href = finalUrl;
}

function goToCrx() {
  const path = getContentPath();
  const crxPath = `/crx/de/index.jsp#${path}`;
  window.open(crxPath, "_blank", "noopener,noreferrer");
}

// ------------------ Execution ------------------

(async function () {
  // Base AEM environments (defaults)
  const defaultDomains = ["localhost", "aemcloud.net"];

  // Load custom domains
  const { aemDomains = [] } = await chrome.storage.sync.get("aemDomains");
  const allDomains = [...defaultDomains, ...aemDomains];

  // Check if current hostname matches any configured domain
  const isAEM = allDomains.some(domain => location.hostname.includes(domain));

  if (!isAEM) return; // do not inject toolbar

  if (window.hasRunAEMToolbar) return;
  window.hasRunAEMToolbar = true;

  const ready = () => (document.body ? initToolbar() : setTimeout(ready, 200));
  ready();
})();
