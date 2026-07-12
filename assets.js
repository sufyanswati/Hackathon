/* ==============================================================
   assets.js
   Asset Management module — Firestore CRUD, search, filter.
   ES6 module. No frameworks, no jQuery.

   IMPORTANT:
   This file expects a "firebase-config.js" file (already created
   during your Login/Signup work) that initializes Firebase and
   exports the Firestore instance as `db`. Example of what that
   file should look like:

     // firebase-config.js
     import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
     import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
     import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

     const firebaseConfig = { ...your config... };
     const app = initializeApp(firebaseConfig);
     export const db = getFirestore(app);
     export const auth = getAuth(app);

   Adjust the import path below if your file lives elsewhere.
   ============================================================== */

import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ==============================================================
   DOM REFERENCES
   ============================================================== */
const tableBody = document.getElementById("assetsTableBody");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const addAssetBtn = document.getElementById("addAssetBtn");

// Add/Edit modal
const assetModalOverlay = document.getElementById("assetModalOverlay");
const modalTitle = document.getElementById("modalTitle");
const assetForm = document.getElementById("assetForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");

const assetIdInput = document.getElementById("assetId");
const assetNameInput = document.getElementById("assetName");
const categoryInput = document.getElementById("category");
const locationInput = document.getElementById("location");
const conditionInput = document.getElementById("condition");
const statusInput = document.getElementById("status");
const lastServiceInput = document.getElementById("lastService");
const nextServiceInput = document.getElementById("nextService");

// View modal
const viewModalOverlay = document.getElementById("viewModalOverlay");
const viewDetailsList = document.getElementById("viewDetailsList");
const closeViewModalBtn = document.getElementById("closeViewModalBtn");
const closeViewBtn = document.getElementById("closeViewBtn");

// Delete modal
const deleteModalOverlay = document.getElementById("deleteModalOverlay");
const deleteAssetNameEl = document.getElementById("deleteAssetName");
const closeDeleteModalBtn = document.getElementById("closeDeleteModalBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

// Toast
const toast = document.getElementById("toast");

/* NOTE: Sidebar open/close (hamburger + overlay + close button) is handled
   by your existing dashboard.js, which is loaded alongside this file in
   assets.html. No need to duplicate that logic here. */

/* ==============================================================
   STATE
   ============================================================== */
let allAssets = []; // full list of assets loaded from Firestore (live)
let assetPendingDelete = null; // id of asset waiting for delete confirmation

/* ==============================================================
   FIRESTORE: REAL-TIME READ
   Listens to the "assets" collection and re-renders the table
   whenever data changes (add/edit/delete from any client).
   ============================================================== */
const assetsCollectionRef = collection(db, "assets");
const assetsQuery = query(assetsCollectionRef, orderBy("createdAt", "desc"));

onSnapshot(
  assetsQuery,
  (snapshot) => {
    allAssets = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    loadingState.hidden = true;
    renderTable();
  },
  (error) => {
    console.error("Error loading assets:", error);
    loadingState.hidden = true;
    showToast("Failed to load assets. Check your connection.", "error");
  },
);

/* ==============================================================
   RENDER TABLE
   Applies the current search term + status filter to allAssets,
   then draws the rows. Also toggles the empty state.
   ============================================================== */
function renderTable() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filterValue = statusFilter.value;

  const filtered = allAssets.filter((asset) => {
    const matchesSearch =
      !searchTerm ||
      (asset.assetName || "").toLowerCase().includes(searchTerm) ||
      (asset.assetCode || "").toLowerCase().includes(searchTerm);

    const matchesFilter = filterValue === "All" || asset.status === filterValue;

    return matchesSearch && matchesFilter;
  });

  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  filtered.forEach((asset) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(asset.assetCode)}</td>
      <td>${escapeHtml(asset.assetName)}</td>
      <td>${escapeHtml(asset.category)}</td>
      <td>${escapeHtml(asset.location)}</td>
      <td>${renderStatusBadge(asset.status)}</td>
      <td>${formatDate(asset.lastService)}</td>
      <td class="actions-cell">
        <button class="btn-icon-only" title="View" data-action="view" data-id="${asset.id}"><i class='bx bx-show'></i></button>
        <button class="btn-icon-only" title="Edit" data-action="edit" data-id="${asset.id}"><i class='bx bx-edit'></i></button>
        <button class="btn-icon-only" title="Delete" data-action="delete" data-id="${asset.id}"><i class='bx bx-trash'></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/* Small helper to render a colored status badge */
function renderStatusBadge(status) {
  const classMap = {
    Operational: "status-operational",
    Maintenance: "status-maintenance",
    "Out of Service": "status-out-of-service",
  };
  const cssClass = classMap[status] || "status-operational";
  return `<span class="status-badge ${cssClass}">${escapeHtml(status || "")}</span>`;
}

/* Prevent basic HTML injection since we build rows with innerHTML */
function escapeHtml(value) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Format an ISO date (YYYY-MM-DD) into a friendlier display format */
function formatDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ==============================================================
   SEARCH + FILTER LISTENERS
   ============================================================== */
searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);

/* ==============================================================
   ASSET CODE GENERATOR (AST-001, AST-002, ...)
   Looks at the assets already loaded in memory and picks the next
   number in sequence. Works fine for a hackathon-scale dataset;
   for a production app with concurrent writes you'd want a
   Firestore transaction on a dedicated counter document instead.
   ============================================================== */
function generateNextAssetCode() {
  let maxNumber = 0;

  allAssets.forEach((asset) => {
    const match = /^AST-(\d+)$/.exec(asset.assetCode || "");
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  });

  const nextNumber = maxNumber + 1;
  return `AST-${String(nextNumber).padStart(3, "0")}`;
}

/* ==============================================================
   MODAL: ADD / EDIT ASSET
   ============================================================== */
function openAddModal() {
  modalTitle.textContent = "Add Asset";
  assetForm.reset();
  assetIdInput.value = "";
  clearAllErrors();
  assetModalOverlay.hidden = false;
}

function openEditModal(asset) {
  modalTitle.textContent = "Edit Asset";
  clearAllErrors();
  assetIdInput.value = asset.id;
  assetNameInput.value = asset.assetName || "";
  categoryInput.value = asset.category || "";
  locationInput.value = asset.location || "";
  conditionInput.value = asset.condition || "";
  statusInput.value = asset.status || "";
  lastServiceInput.value = asset.lastService || "";
  nextServiceInput.value = asset.nextService || "";
  assetModalOverlay.hidden = false;
}

function closeAssetModal() {
  assetModalOverlay.hidden = true;
}

addAssetBtn.addEventListener("click", openAddModal);
closeModalBtn.addEventListener("click", closeAssetModal);
cancelBtn.addEventListener("click", closeAssetModal);
assetModalOverlay.addEventListener("click", (e) => {
  if (e.target === assetModalOverlay) closeAssetModal();
});

/* ==============================================================
   FORM VALIDATION
   Returns true if valid, false otherwise. Shows friendly inline
   error messages next to each invalid field.
   ============================================================== */
function validateForm() {
  clearAllErrors();
  let isValid = true;

  const fields = [
    {
      input: assetNameInput,
      id: "assetName",
      message: "Please enter the asset name.",
    },
    {
      input: categoryInput,
      id: "category",
      message: "Please select a category.",
    },
    {
      input: locationInput,
      id: "location",
      message: "Please enter a location.",
    },
    {
      input: conditionInput,
      id: "condition",
      message: "Please select the asset condition.",
    },
    { input: statusInput, id: "status", message: "Please select a status." },
    {
      input: lastServiceInput,
      id: "lastService",
      message: "Please select the last service date.",
    },
    {
      input: nextServiceInput,
      id: "nextService",
      message: "Please select the next service date.",
    },
  ];

  fields.forEach(({ input, id, message }) => {
    if (!input.value.trim()) {
      showFieldError(id, message);
      isValid = false;
    }
  });

  // Extra check: next service date should not be before last service date
  if (
    lastServiceInput.value &&
    nextServiceInput.value &&
    new Date(nextServiceInput.value) < new Date(lastServiceInput.value)
  ) {
    showFieldError(
      "nextService",
      "Next service date cannot be before the last service date.",
    );
    isValid = false;
  }

  return isValid;
}

function showFieldError(fieldId, message) {
  const errorEl = document.getElementById(`err-${fieldId}`);
  const inputEl = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) inputEl.closest(".form-group")?.classList.add("has-error");
}

function clearAllErrors() {
  document
    .querySelectorAll(".error-msg")
    .forEach((el) => (el.textContent = ""));
  document
    .querySelectorAll(".form-group")
    .forEach((el) => el.classList.remove("has-error"));
}

/* ==============================================================
   FORM SUBMIT: ADD OR UPDATE ASSET
   ============================================================== */
assetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  const editingId = assetIdInput.value;

  const assetData = {
    assetName: assetNameInput.value.trim(),
    category: categoryInput.value,
    location: locationInput.value.trim(),
    condition: conditionInput.value,
    status: statusInput.value,
    lastService: lastServiceInput.value,
    nextService: nextServiceInput.value,
  };

  try {
    if (editingId) {
      // UPDATE existing asset — assetCode stays the same
      await updateDoc(doc(db, "assets", editingId), assetData);
      showToast("Asset updated successfully.", "success");
    } else {
      // ADD new asset — generate a fresh asset code + createdAt timestamp
      const newAsset = {
        ...assetData,
        assetCode: generateNextAssetCode(),
        createdAt: serverTimestamp(),
      };
      await addDoc(assetsCollectionRef, newAsset);
      showToast("Asset added successfully.", "success");
    }
    closeAssetModal();
  } catch (error) {
    console.error("Error saving asset:", error);
    showToast("Something went wrong while saving. Please try again.", "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Asset";
  }
});

/* ==============================================================
   TABLE ACTIONS: VIEW / EDIT / DELETE
   Uses event delegation so it works for dynamically rendered rows.
   ============================================================== */
tableBody.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  const asset = allAssets.find((a) => a.id === id);
  if (!asset) return;

  if (action === "view") openViewModal(asset);
  if (action === "edit") openEditModal(asset);
  if (action === "delete") openDeleteModal(asset);
});

/* ----- VIEW modal ----- */
function openViewModal(asset) {
  viewDetailsList.innerHTML = `
    <dt>Asset Code</dt><dd>${escapeHtml(asset.assetCode)}</dd>
    <dt>Asset Name</dt><dd>${escapeHtml(asset.assetName)}</dd>
    <dt>Category</dt><dd>${escapeHtml(asset.category)}</dd>
    <dt>Location</dt><dd>${escapeHtml(asset.location)}</dd>
    <dt>Condition</dt><dd>${escapeHtml(asset.condition)}</dd>
    <dt>Status</dt><dd>${renderStatusBadge(asset.status)}</dd>
    <dt>Last Service</dt><dd>${formatDate(asset.lastService)}</dd>
    <dt>Next Service</dt><dd>${formatDate(asset.nextService)}</dd>
  `;
  viewModalOverlay.hidden = false;
}

function closeViewModal() {
  viewModalOverlay.hidden = true;
}

closeViewModalBtn.addEventListener("click", closeViewModal);
closeViewBtn.addEventListener("click", closeViewModal);
viewModalOverlay.addEventListener("click", (e) => {
  if (e.target === viewModalOverlay) closeViewModal();
});

/* ----- DELETE confirmation modal ----- */
function openDeleteModal(asset) {
  assetPendingDelete = asset.id;
  deleteAssetNameEl.textContent = asset.assetName || "this asset";
  deleteModalOverlay.hidden = false;
}

function closeDeleteModal() {
  assetPendingDelete = null;
  deleteModalOverlay.hidden = true;
}

closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
deleteModalOverlay.addEventListener("click", (e) => {
  if (e.target === deleteModalOverlay) closeDeleteModal();
});

confirmDeleteBtn.addEventListener("click", async () => {
  if (!assetPendingDelete) return;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = "Deleting...";

  try {
    await deleteDoc(doc(db, "assets", assetPendingDelete));
    showToast("Asset deleted.", "success");
  } catch (error) {
    console.error("Error deleting asset:", error);
    showToast("Failed to delete asset. Please try again.", "error");
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Delete";
    closeDeleteModal();
  }
});

/* ==============================================================
   TOAST NOTIFICATIONS
   ============================================================== */
let toastTimeout = null;

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast show toast-${type}`;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
