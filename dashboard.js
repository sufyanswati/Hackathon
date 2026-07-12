/* ==========================================================================
   MaintainIQ — Dashboard JavaScript
   Basic UI interactions only. NO Firebase / Firestore / CRUD logic yet.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initSidebarToggle();
  initSidebarNavigation();
  initStatCounters();
  renderDummyAssets();
  renderDummyIssues();
  initQuickActionButtons();
  initNotificationButton();
});

/* ==========================================================================
   1. Sidebar Toggle (Mobile)
   ========================================================================== */
function initSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebarClose = document.getElementById("sidebarClose");
  const overlay = document.getElementById("overlay");

  const openSidebar = () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
  };

  const closeSidebar = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  };

  hamburgerBtn.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);
}

/* ==========================================================================
   2. Sidebar Navigation (Active State)
   ========================================================================== */
function initSidebarNavigation() {
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  const pageTitle = document.querySelector(".page-title");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all items, then add to the clicked one
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      // Update the top navbar title to match the selected section
      const pageName = item.getAttribute("data-page");
      pageTitle.textContent =
        pageName.charAt(0).toUpperCase() + pageName.slice(1);

      // On mobile, close the sidebar after a selection is made
      if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("active");
        document.getElementById("overlay").classList.remove("active");
      }
    });
  });

  // Logout button placeholder (Firebase logout will be wired in later)
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Logout clicked — Firebase sign-out logic will go here.");
  });
}

/* ==========================================================================
   3. Animated Statistic Counters
   ========================================================================== */
function initStatCounters() {
  // Dummy target values — replace with real Firestore counts later
  const stats = {
    totalAssetsCount: 0,
    openIssuesCount: 0,
    underMaintenanceCount: 0,
    resolvedIssuesCount: 0,
  };

  Object.keys(stats).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = stats[id];
  });
}

/* ==========================================================================
   4. Recent Assets Table (Dummy Data)
   ========================================================================== */
function renderDummyAssets() {
  const dummyAssets = [
    {
      code: "AST-1042",
      name: "Dell Latitude 5420",
      category: "Laptop",
      status: "active",
    },
    {
      code: "AST-1039",
      name: "HP LaserJet Pro M404",
      category: "Printer",
      status: "maintenance",
    },
    {
      code: "AST-1035",
      name: "Split AC Unit - 1.5 Ton",
      category: "HVAC",
      status: "active",
    },
    {
      code: "AST-1028",
      name: "Cisco Catalyst Switch",
      category: "Networking",
      status: "inactive",
    },
    {
      code: "AST-1021",
      name: "Office Chair - Ergonomic",
      category: "Furniture",
      status: "active",
    },
  ];

  const statusLabels = {
    active: "Active",
    maintenance: "Maintenance",
    inactive: "Inactive",
  };

  const tbody = document.getElementById("assetsTableBody");

  tbody.innerHTML = dummyAssets
    .map(
      (asset) => `
    <tr>
      <td class="asset-code">${asset.code}</td>
      <td>${asset.name}</td>
      <td>${asset.category}</td>
      <td><span class="status-badge status-${asset.status}">${statusLabels[asset.status]}</span></td>
      <td>
        <button class="table-action-btn" data-asset-code="${asset.code}">
          <i class='bx bx-show'></i> View
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

/* ==========================================================================
   5. Recent Issues Table (Dummy Data)
   ========================================================================== */
function renderDummyIssues() {
  const dummyIssues = [
    {
      id: "ISS-2081",
      asset: "Dell Latitude 5420",
      priority: "high",
      status: "open",
      assignedTo: "Ahmed Raza",
    },
    {
      id: "ISS-2077",
      asset: "HP LaserJet Pro M404",
      priority: "medium",
      status: "progress",
      assignedTo: "Sara Khan",
    },
    {
      id: "ISS-2069",
      asset: "Cisco Catalyst Switch",
      priority: "high",
      status: "open",
      assignedTo: "Unassigned",
    },
    {
      id: "ISS-2054",
      asset: "Split AC Unit - 1.5 Ton",
      priority: "low",
      status: "resolved",
      assignedTo: "Bilal Ahmed",
    },
    {
      id: "ISS-2047",
      asset: "Office Chair - Ergonomic",
      priority: "low",
      status: "resolved",
      assignedTo: "Sara Khan",
    },
  ];

  const priorityLabels = { high: "High", medium: "Medium", low: "Low" };
  const statusLabels = {
    open: "Open",
    progress: "In Progress",
    resolved: "Resolved",
  };

  const tbody = document.getElementById("issuesTableBody");

  tbody.innerHTML = dummyIssues
    .map(
      (issue) => `
    <tr>
      <td class="asset-code">${issue.id}</td>
      <td>${issue.asset}</td>
      <td><span class="priority-badge priority-${issue.priority}">${priorityLabels[issue.priority]}</span></td>
      <td><span class="status-badge status-${issue.status}">${statusLabels[issue.status]}</span></td>
      <td>${issue.assignedTo}</td>
    </tr>
  `,
    )
    .join("");
}

/* ==========================================================================
   6. Quick Action Buttons (Placeholders)
   ========================================================================== */
function initQuickActionButtons() {
  const addAssetBtn = document.getElementById("addAssetBtn");
  const reportIssueBtn = document.getElementById("reportIssueBtn");

  addAssetBtn.addEventListener("click", () => {
    // TODO: Open "Add Asset" modal/page once Asset Management module is built
    console.log("Add Asset clicked — hook up Asset Management module here.");
  });

  reportIssueBtn.addEventListener("click", () => {
    // TODO: Open "Report Issue" modal/page once Issue module is built
    console.log("Report Issue clicked — hook up Issue Management module here.");
  });
}

/* ==========================================================================
   7. Notification Button (Placeholder)
   ========================================================================== */
function initNotificationButton() {
  const notificationBtn = document.getElementById("notificationBtn");

  notificationBtn.addEventListener("click", () => {
    // TODO: Replace with a real dropdown once notifications are wired to Firestore
    console.log("Notifications clicked — dropdown UI to be added later.");
  });
}
