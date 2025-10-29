(function () {
  // Ejecutar también dentro de iframes de AEM (editor)
  const isAEM =
    location.hostname.includes("localhost") ||
    location.hostname.includes("aemcloud.net");
  if (!isAEM) return;

  // Evitar ejecutar varias veces
  if (window.hasRunAEMToolbar) return;
  window.hasRunAEMToolbar = true;

  // Esperar a que el body exista
  const ready = () => (document.body ? initToolbar() : setTimeout(ready, 200));
  ready();

  function initToolbar() {
    // Evitar duplicados si el toolbar ya existe
    if (document.querySelector(".aem-toolbar")) return;

    const toolbar = document.createElement("div");
    toolbar.className = "aem-toolbar";

    const buttons = [
      { label: "Edit", action: goToEditor },
      { label: "View", action: goToContent },
      { label: "Sites", action: goToSites },
      { label: "CRXDE", action: goToCrx },
    ];

    for (const { label, action } of buttons) {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = "aem-toolbar-btn";
      btn.onclick = action;
      toolbar.appendChild(btn);
    }

    document.body.appendChild(toolbar);
  }

  // ------------------ Navegación ------------------

  function getContentPath() {
    const path = window.location.pathname;
    if (path.startsWith("/editor.html"))
      return path.replace("/editor.html", "");
    if (path.startsWith("/sites.html")) return path.replace("/sites.html", "");
    return path;
  }

  function goToEditor() {
    const path = getContentPath();
    if (!path.startsWith("/content/")) {
      alert("No parece una ruta de contenido válida en AEM.");
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
})();
