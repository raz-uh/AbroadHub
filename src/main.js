import { countries, countryOrder, regions, studyTypes } from "./data/countries.js";

const checklistKey = "abroad-hub:checklist:v1";
const budgetKey = "abroad-hub:budget:v1";
const selectedCountryKey = "abroad-hub:country:v1";
const moneyFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const fields = ["tuition", "living", "visa", "travel"];
const compareSelection = new Set();
let storageWarning = "";

const countrySelect = document.querySelector("#country-select");
const checklistGrid = document.querySelector("#checklist-grid");
const countryIntro = document.querySelector("#country-intro");
const progress = document.querySelector("#checklist-progress");
const total = document.querySelector("#estimate-total");
const notice = document.querySelector("#storage-notice");
const destinationResults = document.querySelector("#destination-results");
const comparePanel = document.querySelector("#compare-panel");
const compareButton = document.querySelector("#compare-button");
const compareHint = document.querySelector("#compare-hint");
let comparisonActive = false;
const storedCountry = readStorage(selectedCountryKey, "australia");
let selectedCountry = countryOrder.includes(storedCountry) ? storedCountry : "australia";
let checkedItems = loadCheckedItems();

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    storageWarning = "Saved browser data could not be read. New progress may not stay after you leave this page.";
    return fallback;
  }
}

function loadCheckedItems() {
  const saved = readStorage(checklistKey, []);
  return new Set(Array.isArray(saved) ? saved.filter((value) => typeof value === "string") : []);
}

function showStorageWarning(message) {
  notice.textContent = message || storageWarning;
}

function saveCheckedItems() {
  try {
    localStorage.setItem(checklistKey, JSON.stringify([...checkedItems]));
    notice.textContent = "";
  } catch {
    showStorageWarning("Your browser could not save progress. Your checked items may not stay after you leave this page.");
  }
}

function formatNpr(amount) {
  return `NPR ${moneyFormatter.format(Math.max(0, Math.round(amount || 0)))}`;
}

function formatReviewDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderCountryOptions() {
  countrySelect.innerHTML = countryOrder.map((id) => {
    const country = countries[id];
    return `<option value="${id}">${country.flag}  ${country.name}</option>`;
  }).join("");
}

function renderFilters() {
  document.querySelector("#region-filter").innerHTML = regions
    .map((region) => `<option value="${region}">${region}</option>`).join("");
  document.querySelector("#study-filter").innerHTML = studyTypes
    .map((type) => `<option value="${type}">${type}</option>`).join("");
}

function renderDestinations() {
  const query = document.querySelector("#country-search").value.trim().toLocaleLowerCase();
  const region = document.querySelector("#region-filter").value;
  const type = document.querySelector("#study-filter").value;
  const visible = countryOrder
    .map((id) => countries[id])
    .filter((country) =>
      (!query || `${country.name} ${country.region} ${country.studyTypes.join(" ")}`.toLocaleLowerCase().includes(query))
      && (region === "All regions" || country.region === region)
      && (type === "All study types" || country.studyTypes.includes(type)),
    );

  if (visible.length === 0) {
    destinationResults.innerHTML = '<p class="empty-results">No destinations match. Try a different search or filter.</p>';
  } else {
    destinationResults.innerHTML = visible.map((country) => `
      <article class="destination-card ${country.id === selectedCountry ? "is-selected" : ""}">
        <div class="destination-card-top">
          <span class="destination-flag" aria-hidden="true">${country.flag}</span>
          <div class="destination-name">
            <h3>${country.name}</h3>
            <p>${country.region}</p>
          </div>
          <label class="compare-toggle">
            <input type="checkbox" data-compare-country="${country.id}" ${compareSelection.has(country.id) ? "checked" : ""} aria-label="Add ${country.name} to cost comparison">
            Compare
          </label>
        </div>
        <div class="destination-types">${country.studyTypes.map((studyType) => `<span>${studyType}</span>`).join("")}</div>
        <div class="destination-cost">
          <span>
            <small>Tuition guide · reviewed ${formatReviewDate(country.lastVerified)}</small>
            <strong>${country.tuitionRange}</strong>
            <a href="${(country.source.study ?? country.countrySource).url}" target="_blank" rel="noopener noreferrer">Source ↗</a>
          </span>
          <span>
            <small>Visa / permit · reviewed ${formatReviewDate(country.fees[0].lastVerified)}</small>
            <strong>${country.fees[0].amount}</strong>
            <a href="${country.fees[0].source.url}" target="_blank" rel="noopener noreferrer">Source ↗</a>
          </span>
        </div>
        <button class="destination-select" type="button" data-select-country="${country.id}" aria-pressed="${country.id === selectedCountry}">
          ${country.id === selectedCountry ? "Selected destination" : "Choose destination"} <span aria-hidden="true">→</span>
        </button>
      </article>
    `).join("");
  }

  destinationResults.querySelectorAll("[data-select-country]").forEach((button) => {
    button.addEventListener("click", () => selectCountry(button.dataset.selectCountry, true));
  });
  destinationResults.querySelectorAll("[data-compare-country]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked && compareSelection.size >= 3) {
        checkbox.checked = false;
        compareHint.textContent = "Compare up to 3 destinations at a time.";
        return;
      }
      if (checkbox.checked) compareSelection.add(checkbox.dataset.compareCountry);
      else compareSelection.delete(checkbox.dataset.compareCountry);
      updateCompareControls();
    });
  });
}

function selectCountry(countryId, scrollToPlanner = false) {
  if (!countries[countryId]) return;
  selectedCountry = countryId;
  try {
    localStorage.setItem(selectedCountryKey, JSON.stringify(countryId));
    notice.textContent = "";
  } catch {
    showStorageWarning("Your browser could not save the selected country. It will reset when you leave this page.");
  }
  renderDestinations();
  renderChecklist(countryId);
  renderBudget(countryId);
  renderCountryGuide(countryId);
  if (scrollToPlanner) {
    document.querySelector("#planner").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function getItemKey(country, section, entry) {
  return `${country.id}:${section.id}:${entry.id}`;
}

function renderChecklist(countryId) {
  const country = countries[countryId];
  countrySelect.value = countryId;
  document.querySelector("#current-country").innerHTML = `<span class="country-flag" aria-hidden="true">${country.flag}</span> ${country.name}`;
  document.querySelector("#planner-country-label").textContent = country.name.toLocaleUpperCase();
  countryIntro.innerHTML = `<p>${country.intro}</p><a href="${country.countrySource.url}" target="_blank" rel="noopener noreferrer">Official visa guidance ↗</a>`;
  checklistGrid.innerHTML = country.sections.map((section) => `
    <article class="checklist-card">
      <div class="checklist-card-heading">
        <span class="section-icon" aria-hidden="true">${section.icon}</span>
        <h3>${section.title}</h3>
        <span class="section-count">${section.items.length} ITEMS</span>
      </div>
      <ul class="checklist-list">
        ${section.items.map((entry) => {
          const itemKey = getItemKey(country, section, entry);
          const date = formatReviewDate(entry.lastVerified);
          return `<li class="checklist-item">
            <input id="${itemKey}" type="checkbox" data-item-key="${itemKey}" ${checkedItems.has(itemKey) ? "checked" : ""} aria-label="${entry.title}">
            <div class="item-content">
              <label class="item-title" for="${itemKey}">
                <span class="item-title-text">${entry.title}</span>
                <span class="verified-badge" title="Guide review date. Rules and fees may change; confirm with the linked official source.">Last verified ${date}</span>
              </label>
              <p class="item-description">${entry.description}</p>
              <a class="item-source" href="${entry.source.url}" target="_blank" rel="noopener noreferrer">${entry.source.label} <span aria-hidden="true">↗</span></a>
            </div>
          </li>`;
        }).join("")}
      </ul>
    </article>
  `).join("");
  checklistGrid.querySelectorAll("[data-item-key]").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) checkedItems.add(input.dataset.itemKey);
      else checkedItems.delete(input.dataset.itemKey);
      saveCheckedItems();
      updateProgress(country);
    });
  });
  updateProgress(country);
}

function updateProgress(country) {
  const items = country.sections.flatMap((section) =>
    section.items.map((entry) => getItemKey(country, section, entry)),
  );
  const complete = items.filter((key) => checkedItems.has(key)).length;
  progress.textContent = `${complete} of ${items.length} done`;
}

function renderCountryGuide(countryId) {
  const country = countries[countryId];
  document.querySelector("#guide-country-name").textContent = country.name;
  const officialLink = document.querySelector("#guide-official-link");
  officialLink.href = country.countrySource.url;
  document.querySelector("#fx-review-date").textContent = formatReviewDate(country.lastVerified);
  document.querySelector("#process-list").innerHTML = country.process.map((step) => `
    <li class="process-step">
      <span class="process-number">${String(country.process.indexOf(step) + 1).padStart(2, "0")}</span>
      <div><h4>${step.title}</h4><p>${step.text}</p></div>
    </li>
  `).join("");
  document.querySelector("#fees-list").innerHTML = country.fees.map((fee) => `
    <div class="fee-row">
      <div class="fee-row-heading"><strong>${fee.label}</strong><span>${fee.amount}</span></div>
      <span class="fee-basis">${fee.basis}</span>
      <p>${fee.note}</p>
      <div class="fee-source-row">
        <a href="${fee.source.url}" target="_blank" rel="noopener noreferrer">${fee.source.label} ↗</a>
        <span class="verified-badge">Last verified ${formatReviewDate(fee.lastVerified)}</span>
      </div>
    </div>
  `).join("");
}

function updateCompareControls() {
  compareButton.disabled = compareSelection.size < 2;
  compareHint.textContent = compareSelection.size
    ? `${compareSelection.size} selected · choose ${compareSelection.size < 2 ? "one more to compare" : "up to 3 destinations"}`
    : "Select up to 3 destinations to compare their basic cost benchmarks.";
  if (compareSelection.size < 2) {
    comparePanel.hidden = true;
    comparePanel.innerHTML = "";
  } else if (comparisonActive) {
    renderComparison();
  }
}

function renderComparison() {
  if (compareSelection.size < 2) return;
  const selected = [...compareSelection].map((id) => countries[id]);
  const rows = [
    ["Tuition guide", (country) => ({ amount: country.tuitionRange, source: country.source.study ?? country.countrySource })],
    ["Visa fee", (country) => country.fees.find((fee) => /visa|permit|entry/i.test(fee.label))],
    ["Living funds", (country) => country.fees.find((fee) => /living/i.test(fee.label))],
    ["Health cover", (country) => country.fees.find((fee) => /health/i.test(fee.label))],
  ];
  comparePanel.innerHTML = `
    <div class="compare-table-wrap">
      <table class="compare-table">
        <caption>Basic cost comparison — source currencies are not converted</caption>
        <thead><tr><th scope="col">Cost item</th>${selected.map((country) => `<th scope="col">${country.flag} ${country.name}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(([label, valueFor]) => `<tr><th scope="row">${label}</th>${selected.map((country) => {
          const item = valueFor(country);
          const amount = item?.amount ?? "Check official source";
          const source = item?.source ?? country.countrySource;
          return `<td>${amount}<a class="compare-source" href="${source.url}" target="_blank" rel="noopener noreferrer">Official source ↗</a><span class="compare-date">Last verified ${formatReviewDate(item?.lastVerified ?? country.lastVerified)}</span></td>`;
        }).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
    <p class="compare-note">Tuition ranges are planning guides. Visa, health cover, and funds amounts use each country's currency and may have different coverage periods; verify each linked official source.</p>
  `;
  comparePanel.hidden = false;
}

function readBudget(countryId) {
  const saved = readStorage(budgetKey, {});
  const countryBudget = saved && typeof saved === "object" && !Array.isArray(saved)
    ? saved[countryId]
    : undefined;
  return Object.fromEntries(fields.map((field) => {
    const value = Number(countryBudget?.[field]);
    return [field, Number.isFinite(value) && value >= 0 ? value : countries[countryId].defaults[field]];
  }));
}

function saveBudget(countryId, budget) {
  try {
    const saved = readStorage(budgetKey, {});
    const next = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    next[countryId] = budget;
    localStorage.setItem(budgetKey, JSON.stringify(next));
    notice.textContent = "";
  } catch {
    showStorageWarning("Your browser could not save budget changes. They will be lost when you leave this page.");
  }
}

function renderBudget(countryId) {
  const budget = readBudget(countryId);
  fields.forEach((field) => {
    document.querySelector(`#${field}-input`).value = budget[field];
  });
  updateTotal(budget);
  fields.forEach((field) => {
    document.querySelector(`#${field}-input`).oninput = (event) => {
      const value = Number(event.currentTarget.value);
      budget[field] = Number.isFinite(value) && value >= 0 ? value : 0;
      updateTotal(budget);
      saveBudget(countryId, budget);
    };
  });
}

function updateTotal(budget) {
  total.textContent = formatNpr(fields.reduce((sum, field) => sum + budget[field], 0));
}

function buildCountryPlan() {
  const country = countries[selectedCountry];
  const budget = readBudget(selectedCountry);
  const checklist = country.sections.flatMap((section) =>
    section.items.map((entry) => ({
      section: section.title,
      item: entry.title,
      complete: checkedItems.has(getItemKey(country, section, entry)),
    })),
  );
  const plan = {
    exportedAt: new Date().toISOString(),
    country: { id: country.id, name: country.name },
    budget: { currency: "NPR", ...budget, total: fields.reduce((sum, field) => sum + budget[field], 0) },
    checklist,
    feesAndBenchmarks: country.fees.map((fee) => ({
      label: fee.label,
      amount: fee.amount,
      basis: fee.basis,
      source: fee.source.url,
      lastVerified: fee.lastVerified,
    })),
  };
  return plan;
}

function downloadCountryPlan() {
  const country = countries[selectedCountry];
  const blob = new Blob([document.querySelector("#export-json").value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `abroad-hub-${country.id}-plan.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showExportDialog() {
  const country = countries[selectedCountry];
  document.querySelector("#export-country-name").textContent = country.name;
  document.querySelector("#export-json").value = JSON.stringify(buildCountryPlan(), null, 2);
  document.querySelector("#export-status").textContent = "";
  document.querySelector("#export-dialog").showModal();
}

async function copyExport() {
  const exportText = document.querySelector("#export-json");
  const status = document.querySelector("#export-status");
  try {
    await navigator.clipboard.writeText(exportText.value);
    status.textContent = "Plan copied to clipboard.";
  } catch {
    exportText.focus();
    exportText.select();
    status.textContent = "Clipboard access is unavailable. The JSON is selected; copy it manually.";
  }
}

function resetCountryData() {
  const country = countries[selectedCountry];
  const checklistPrefix = `${country.id}:`;
  const remainingItems = [...checkedItems].filter((key) => !key.startsWith(checklistPrefix));
  const budgets = readStorage(budgetKey, {});
  const remainingBudgets = budgets && typeof budgets === "object" && !Array.isArray(budgets)
    ? { ...budgets }
    : {};
  delete remainingBudgets[country.id];
  try {
    localStorage.setItem(checklistKey, JSON.stringify(remainingItems));
    localStorage.setItem(budgetKey, JSON.stringify(remainingBudgets));
    checkedItems = new Set(remainingItems);
    notice.textContent = "";
    renderChecklist(country.id);
    renderBudget(country.id);
  } catch {
    showStorageWarning("This country could not be fully reset because browser storage is unavailable. Check its checklist and budget before continuing.");
  }
}

function init() {
  renderCountryOptions();
  renderFilters();
  document.querySelector("#country-search").addEventListener("input", renderDestinations);
  document.querySelector("#region-filter").addEventListener("change", renderDestinations);
  document.querySelector("#study-filter").addEventListener("change", renderDestinations);
  compareButton.addEventListener("click", () => {
    comparisonActive = true;
    renderComparison();
  });
  document.querySelector("#export-country").addEventListener("click", showExportDialog);
  document.querySelector("#close-export").addEventListener("click", () => document.querySelector("#export-dialog").close());
  document.querySelector("#copy-export").addEventListener("click", copyExport);
  document.querySelector("#download-export").addEventListener("click", downloadCountryPlan);
  const resetDialog = document.querySelector("#reset-dialog");
  document.querySelector("#reset-country").addEventListener("click", () => resetDialog.showModal());
  document.querySelector("#reset-form").addEventListener("submit", (event) => {
    if (event.submitter?.value !== "reset") return;
    event.preventDefault();
    resetCountryData();
    resetDialog.close();
  });
  countrySelect.addEventListener("change", () => selectCountry(countrySelect.value));
  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  renderDestinations();
  renderChecklist(selectedCountry);
  renderBudget(selectedCountry);
  renderCountryGuide(selectedCountry);
  if (storageWarning) notice.textContent = storageWarning;
  updateCompareControls();
}

init();
