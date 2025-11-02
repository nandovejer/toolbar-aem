// ------------------ Constants ------------------

const ICON = {
  less: `<svg width="128" height="128" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path
        d="M2.732 12c0-.98.92-1.768 2.06-1.768h14.416c1.14 0 2.06.789 2.06 1.768 0 .98-.92 1.768-2.06 1.768H4.792c-1.14 0-2.06-.789-2.06-1.768z" /></svg>`,
  plus: `<svg width="128" height="128" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path
        d="M12 2.732c.98 0 1.768.92 1.768 2.06v14.416c0 1.14-.789 2.06-1.768 2.06-.98 0-1.768-.92-1.768-2.06V4.792c0-1.14.789-2.06 1.768-2.06z" /><path
        d="M2.732 12c0-.98.92-1.768 2.06-1.768h14.416c1.14 0 2.06.789 2.06 1.768 0 .98-.92 1.768-2.06 1.768H4.792c-1.14 0-2.06-.789-2.06-1.768z" /></svg>`,
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
  toggle.textContent = "−";
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
  const group = toolbar.querySelector(".aem-toolbar-group");
  const isHidden = group.classList.toggle("hidden");

  if (isHidden) {
    toggle.textContent = ICON.plus;
    toggle.title = "Show toolbar";
  } else {
    toggle.textContent = ICON.less;
    toggle.title = "Hide toolbar";
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

  document.querySelectorAll(".aem-toolbar-btn").forEach((btn) => {
    btn.disabled = false;
  });

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
  const path = window.location.pathname;
  if (path.startsWith("/editor.html")) return path.replace("/editor.html", "");
  if (path.startsWith("/sites.html")) return path.replace("/sites.html", "");
  return path;
}

function goToEditor() {
  const path = getContentPath();
  if (!path.startsWith("/content/")) {
    alert("Not a valid AEM content path.");
    return;
  }
  window.location.href = `/editor.html${path}`;
}

function goToContent() {
  const path = getContentPath();
  if (path.startsWith("/content/")) window.location.href = path;
  else window.location.href = `/content${path}`;
}

function goToSites() {
  const path = getContentPath();
  window.location.href = `/sites.html${path}`;
}

function goToCrx() {
  const path = getContentPath();
  const crxPath = `/crx/de/index.jsp#${path}`;
  window.open(crxPath, "_blank", "noopener,noreferrer");
}

function toggleToolbar(toolbar, toggle) {
  const isCollapsed = toolbar.classList.toggle("collapsed");

  if (isCollapsed) {
    toggle.textContent = "+";
    toggle.title = "Show toolbar";
  } else {
    toggle.textContent = "−";
    toggle.title = "Hide toolbar";
  }
}

// ------------------ Execution ------------------

(function () {
  const isAEM =
    location.hostname.includes("localhost") ||
    location.hostname.includes("aemcloud.net");
  if (!isAEM) return;

  if (window.hasRunAEMToolbar) return;
  window.hasRunAEMToolbar = true;

  const ready = () => (document.body ? initToolbar() : setTimeout(ready, 200));
  ready();
})();
