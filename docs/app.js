(() => {
  "use strict";

  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const closeMenu = () => {
    siteNav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  };

  menuToggle?.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  siteNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  const clock = document.getElementById("app-clock");
  const showClock = () => {
    if (clock) clock.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit", minute: "2-digit", hour12: false
    }).format(new Date());
  };
  showClock();
  setInterval(showClock, 30000);
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const views = {
    overview: {
      title: "Cluster overview",
      metrics: ['04 <small>/ 04</small>', '18 <small>RUNNING</small>', '27 <small>%</small>'],
      listTitle: "COMPUTE NODES",
      listSubtitle: "04 MACHINES",
      rows: [
        ["compute-01", "PRIMARY NODE", "8 CORES", 42, "ONLINE"],
        ["compute-02", "COMPUTE", "6 CORES", 66, "ONLINE"],
        ["compute-03", "COMPUTE", "8 CORES", 24, "ONLINE"],
        ["storage-01", "STORAGE", "4 CORES", 51, "ONLINE"]
      ]
    },
    nodes: {
      title: "Node inventory",
      metrics: ['04 <small>/ 04</small>', '18 <small>RUNNING</small>', '27 <small>%</small>'],
      listTitle: "MANAGED MACHINES",
      listSubtitle: "04 NODES",
      rows: [
        ["compute-01", "PRIMARY NODE", "8 CORES", 42, "ONLINE"],
        ["compute-02", "COMPUTE", "6 CORES", 66, "ONLINE"],
        ["compute-03", "COMPUTE", "8 CORES", 24, "ONLINE"],
        ["storage-01", "STORAGE", "4 CORES", 51, "ONLINE"]
      ]
    },
    workloads: {
      title: "Running workloads",
      metrics: ['04 <small>/ 04</small>', '18 <small>RUNNING</small>', '27 <small>%</small>'],
      listTitle: "VIRTUAL MACHINES & APPS",
      listSubtitle: "EXAMPLE WORKLOADS",
      rows: [
        ["media-server", "CONTAINER", "MINI-01", 42, "RUNNING"],
        ["home-automation", "VIRTUAL MACHINE", "MINI-02", 22, "RUNNING"],
        ["private-cloud", "CONTAINER", "MINI-03", 57, "RUNNING"],
        ["backup-service", "CONTAINER", "MINI-01", 17, "RUNNING"]
      ]
    }
  };

  const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const title = document.getElementById("preview-title");
  const metricEls = [
    document.getElementById("metric-one"),
    document.getElementById("metric-two"),
    document.getElementById("metric-three")
  ];
  const rowsEl = document.getElementById("preview-rows");
  const listTitle = document.getElementById("list-title");
  const listSubtitle = document.getElementById("list-subtitle");

  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      const view = views[button.dataset.view];
      if (!view) return;
      document.querySelectorAll("[data-view]").forEach(item => {
        const selected = item === button;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      if (title) title.textContent = view.title;
      metricEls.forEach((el, i) => { if (el) el.innerHTML = view.metrics[i]; });
      if (listTitle) listTitle.textContent = view.listTitle;
      if (listSubtitle) listSubtitle.innerHTML = escapeHTML(view.listSubtitle) + ' <span class="accent-arrow">↗</span>';
      if (rowsEl) rowsEl.innerHTML = view.rows.map(([name, role, detail, usage, status]) =>
        '<div class="app-row">' +
          '<span class="app-row-name"><span class="green-led"></span><b>' + escapeHTML(name) + '</b><small>' + escapeHTML(role) + '</small></span>' +
          '<span>' + escapeHTML(detail) + '</span>' +
          '<span class="app-row-usage"><span style="width:' + Number(usage) + '%"></span></span>' +
          '<em>' + escapeHTML(status) + '</em>' +
        '</div>'
      ).join("");
    });
  });
})();