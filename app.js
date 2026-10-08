/**
 * Titanic Passenger Survival Study - Main Application Controller
 */

// Application State
const STATE = {
  activeTab: 'overview',
  filteredDataset: [...TITANIC_DATASET],
  currentPage: 1,
  pageSize: 10,
  filters: {
    search: '',
    sex: 'all',
    pclass: 'all',
    survived: 'all'
  }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderOverviewMetrics();
  initCharts();
  initExplorerFilters();
  renderExplorerTable();
  initPredictorForm();
  initDeckPlan();
  initSimulator();
  renderModelEvaluation();
});

/* ----------------------------------------------------
 * 1. Navigation & Tab Control
 * ---------------------------------------------------- */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  STATE.activeTab = tabId;
  
  // Update Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update Sections
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabId}`);
  });

  // Render/Re-render charts if analytics tab is selected
  if (tabId === 'analytics' || tabId === 'overview') {
    DASHBOARD_CHARTS.renderAll(STATE.filteredDataset);
  }
}

/* ----------------------------------------------------
 * 2. Overview Metrics
 * ---------------------------------------------------- */
function renderOverviewMetrics() {
  const stats = calculateDatasetSummary(TITANIC_DATASET);
  
  document.getElementById('metric-total').innerText = stats.total;
  document.getElementById('metric-survival-rate').innerText = `${stats.survivalRate}%`;
  document.getElementById('metric-survived-count').innerText = `${stats.survivedCount} Survived / ${stats.diedCount} Lost`;
  
  document.getElementById('metric-female-rate').innerText = `${stats.femaleSurvivalRate}%`;
  document.getElementById('metric-male-rate').innerText = `${stats.maleSurvivalRate}%`;
  
  document.getElementById('metric-class1-rate').innerText = `${stats.pclass1Rate}%`;
  document.getElementById('metric-class3-rate').innerText = `${stats.pclass3Rate}%`;
}

/* ----------------------------------------------------
 * 3. Charts Initialization
 * ---------------------------------------------------- */
function initCharts() {
  DASHBOARD_CHARTS.renderAll(TITANIC_DATASET);
}

/* ----------------------------------------------------
 * 4. Data Explorer & Table Logic
 * ---------------------------------------------------- */
function initExplorerFilters() {
  const searchInput = document.getElementById('search-name');
  const filterSex = document.getElementById('filter-sex');
  const filterClass = document.getElementById('filter-class');
  const filterStatus = document.getElementById('filter-status');

  const updateFilters = () => {
    STATE.filters.search = searchInput.value.toLowerCase().trim();
    STATE.filters.sex = filterSex.value;
    STATE.filters.pclass = filterClass.value;
    STATE.filters.survived = filterStatus.value;
    STATE.currentPage = 1;

    applyFilters();
  };

  if (searchInput) searchInput.addEventListener('input', updateFilters);
  if (filterSex) filterSex.addEventListener('change', updateFilters);
  if (filterClass) filterClass.addEventListener('change', updateFilters);
  if (filterStatus) filterStatus.addEventListener('change', updateFilters);

  // Pagination buttons
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (STATE.currentPage > 1) {
        STATE.currentPage--;
        renderExplorerTable();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const maxPages = Math.ceil(STATE.filteredDataset.length / STATE.pageSize);
      if (STATE.currentPage < maxPages) {
        STATE.currentPage++;
        renderExplorerTable();
      }
    });
  }
}

function applyFilters() {
  STATE.filteredDataset = TITANIC_DATASET.filter(passenger => {
    // Name search
    if (STATE.filters.search && !passenger.name.toLowerCase().includes(STATE.filters.search)) {
      return false;
    }
    // Sex
    if (STATE.filters.sex !== 'all' && passenger.sex !== STATE.filters.sex) {
      return false;
    }
    // Pclass
    if (STATE.filters.pclass !== 'all' && passenger.pclass.toString() !== STATE.filters.pclass) {
      return false;
    }
    // Survived
    if (STATE.filters.survived !== 'all' && passenger.survived.toString() !== STATE.filters.survived) {
      return false;
    }
    return true;
  });

  renderExplorerTable();
}

function renderExplorerTable() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  const totalItems = STATE.filteredDataset.length;
  const maxPages = Math.ceil(totalItems / STATE.pageSize) || 1;

  if (STATE.currentPage > maxPages) STATE.currentPage = maxPages;

  const startIndex = (STATE.currentPage - 1) * STATE.pageSize;
  const pageItems = STATE.filteredDataset.slice(startIndex, startIndex + STATE.pageSize);

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">No matching passenger records found.</td></tr>`;
  } else {
    pageItems.forEach(p => {
      const tr = document.createElement('tr');
      const statusBadge = p.survived === 1 
        ? `<span class="badge-survived">Survived</span>` 
        : `<span class="badge-perished">Perished</span>`;

      tr.innerHTML = `
        <td>#${p.id}</td>
        <td style="font-weight: 600;">${p.name}</td>
        <td><span style="text-transform: capitalize;">${p.sex}</span></td>
        <td>Class ${p.pclass}</td>
        <td>${p.age ? p.age : 'N/A'}</td>
        <td>£${p.fare.toFixed(2)}</td>
        <td>${p.embarked}</td>
        <td>${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Update Pagination Info
  const pageInfo = document.getElementById('page-info');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  if (pageInfo) pageInfo.innerText = `Page ${STATE.currentPage} of ${maxPages} (${totalItems} Records)`;
  if (btnPrev) btnPrev.disabled = STATE.currentPage === 1;
  if (btnNext) btnNext.disabled = STATE.currentPage >= maxPages;
}

/* ----------------------------------------------------
 * 5. Predictive Calculator Form & Results
 * ---------------------------------------------------- */
function initPredictorForm() {
  const form = document.getElementById('predictor-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const passenger = {
      sex: document.getElementById('pred-sex').value,
      pclass: parseInt(document.getElementById('pred-pclass').value),
      age: parseFloat(document.getElementById('pred-age').value),
      sibsp: parseInt(document.getElementById('pred-sibsp').value),
      parch: parseInt(document.getElementById('pred-parch').value),
      fare: parseFloat(document.getElementById('pred-fare').value),
      embarked: document.getElementById('pred-embarked').value,
      cabin: document.getElementById('pred-cabin').value
    };

    const result = ML_ENGINE.predict(passenger);
    renderPredictionResult(result);
  });

  // Run initial prediction
  form.dispatchEvent(new Event('submit'));
}

function renderPredictionResult(result) {
  const probElem = document.getElementById('pred-prob');
  const statusElem = document.getElementById('pred-status');
  const attrElem = document.getElementById('pred-attribution');

  if (probElem) probElem.innerText = `${result.probability}%`;
  
  if (statusElem) {
    statusElem.innerText = result.riskLevel;
    statusElem.className = `gauge-status ${result.survivedPrediction === 1 ? 'survived' : 'perished'}`;
  }

  if (attrElem) {
    attrElem.innerHTML = '';
    result.featureImpacts.forEach(item => {
      const div = document.createElement('div');
      div.className = `attr-item ${item.type}`;
      
      const valText = item.weight > 0 ? `+${item.weight.toFixed(2)}` : `${item.weight.toFixed(2)}`;
      div.innerHTML = `
        <div>
          <strong style="color: var(--text-main);">${item.feature}</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${item.impactText}</div>
        </div>
        <span class="attr-badge ${item.type}">${valText}</span>
      `;
      attrElem.appendChild(div);
    });
  }
}

/* ----------------------------------------------------
 * 6. Deck Layout & Spatial Analysis
 * ---------------------------------------------------- */
function initDeckPlan() {
  const deckContainer = document.getElementById('deck-cards-container');
  if (!deckContainer) return;

  const decks = [
    { name: 'Deck A (Promenade Deck)', pclass: '1st Class', desc: 'Top deck housing luxury suites, reading rooms, and officer quarters.', survivalRate: '64.3%', color: 'var(--accent-gold)' },
    { name: 'Deck B (Bridge Deck)', pclass: '1st Class', desc: 'A La Carte Restaurant, Cafe Parisien, and premier 1st class staterooms.', survivalRate: '71.0%', color: 'var(--accent-gold)' },
    { name: 'Deck C (Shelter Deck)', pclass: '1st & 2nd Class', desc: 'Main crew galley, purser office, and spacious cabins.', survivalRate: '59.2%', color: 'var(--accent-cyan)' },
    { name: 'Deck D (Saloon Deck)', pclass: '1st, 2nd & 3rd Class', desc: 'Grand Dining Saloon, 2nd class dining, and reception rooms.', survivalRate: '43.8%', color: 'var(--accent-cyan)' },
    { name: 'Deck E (Upper Deck)', pclass: 'All Classes', desc: 'Crew accommodation, 3rd class communal areas ("Scotland Road").', survivalRate: '41.7%', color: 'var(--accent-purple)' },
    { name: 'Deck F (Middle Deck)', pclass: '2nd & 3rd Class', desc: 'Swimming bath, Turkish baths, and 3rd class dining rooms.', survivalRate: '33.3%', color: 'var(--accent-purple)' },
    { name: 'Deck G (Lower Deck)', pclass: '3rd Class & Crew', desc: 'Engine boilers, baggage rooms, and lowest passenger berths.', survivalRate: '25.0%', color: 'var(--accent-rose)' }
  ];

  deckContainer.innerHTML = '';
  decks.forEach(d => {
    const card = document.createElement('div');
    card.className = 'deck-card';
    card.style.borderLeft = `4px solid ${d.color}`;
    card.innerHTML = `
      <div class="deck-title">${d.name}</div>
      <div style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">Primarily ${d.pclass}</div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">${d.desc}</p>
      <div class="deck-stats">
        <span>Estimated Survival Rate:</span>
        <strong style="color: ${d.color}; font-size: 1.1rem;">${d.survivalRate}</strong>
      </div>
    `;
    deckContainer.appendChild(card);
  });
}

/* ----------------------------------------------------
 * 7. What-If Scenario Simulator
 * ---------------------------------------------------- */
function initSimulator() {
  const lifeboatSlider = document.getElementById('sim-lifeboats');
  const femalePrioritySlider = document.getElementById('sim-female-priority');

  const updateSim = () => {
    const lifeboats = parseInt(lifeboatSlider.value);
    const femalePriority = parseInt(femalePrioritySlider.value);

    document.getElementById('sim-lifeboats-val').innerText = `${lifeboats} Lifeboats (${lifeboats * 65} Seats)`;
    document.getElementById('sim-priority-val').innerText = `${femalePriority}% Enforced`;

    // Calculate simulated survival numbers
    const totalCapacity = lifeboats * 65;
    const basePassengers = 2224; // Total historical onboard
    const simulatedSurvivors = Math.min(basePassengers, Math.round(totalCapacity * 0.85)); // 85% occupancy realism
    const simulatedRate = ((simulatedSurvivors / basePassengers) * 100).toFixed(1);

    document.getElementById('sim-survivors').innerText = simulatedSurvivors;
    document.getElementById('sim-rate').innerText = `${simulatedRate}%`;
    document.getElementById('sim-saved-delta').innerText = `+${simulatedSurvivors - 710} Lives Saved vs History (710 Actual)`;
  };

  if (lifeboatSlider) lifeboatSlider.addEventListener('input', updateSim);
  if (femalePrioritySlider) femalePrioritySlider.addEventListener('input', updateSim);

  if (lifeboatSlider) updateSim();
}

/* ----------------------------------------------------
 * 8. Model Evaluation Metrics
 * ---------------------------------------------------- */
function renderModelEvaluation() {
  const metrics = ML_ENGINE.evaluateDataset(TITANIC_DATASET);

  const accElem = document.getElementById('eval-accuracy');
  const precElem = document.getElementById('eval-precision');
  const recElem = document.getElementById('eval-recall');
  const f1Elem = document.getElementById('eval-f1');

  if (accElem) accElem.innerText = `${metrics.accuracy}%`;
  if (precElem) precElem.innerText = `${metrics.precision}%`;
  if (recElem) recElem.innerText = `${metrics.recall}%`;
  if (f1Elem) f1Elem.innerText = `${metrics.f1Score}%`;

  const cm = metrics.confusionMatrix;
  const tpEl = document.getElementById('cm-tp');
  const fpEl = document.getElementById('cm-fp');
  const fnEl = document.getElementById('cm-fn');
  const tnEl = document.getElementById('cm-tn');

  if (tpEl) tpEl.innerText = cm.tp;
  if (fpEl) fpEl.innerText = cm.fp;
  if (fnEl) fnEl.innerText = cm.fn;
  if (tnEl) tnEl.innerText = cm.tn;
}
