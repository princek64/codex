import { countryReadinessProfiles, documentRules, officialSources, OFFICIAL_SOURCE_REFRESH_POLICY } from './data/guidelines.js';
import { scoreApplication } from './lib/scoring.js';

const initialState = {
  destination: 'France',
  tripDays: 14,
  leadDays: 35,
  availableFundsInr: 180000,
  priorSchengenVisa: 'none',
  travelHistory: 'some',
  mainDestinationMismatch: false,
  unexplainedDeposits: false,
  documents: Object.fromEntries(documentRules.map((rule) => [rule.id, rule.required ? 'needsReview' : 'missing'])),
};

let state = structuredClone(initialState);

function setState(patch) {
  state = { ...state, ...patch, documents: { ...state.documents, ...(patch.documents ?? {}) } };
  render();
}

function selectedProfile() {
  return countryReadinessProfiles.find((profile) => profile.country === state.destination) ?? countryReadinessProfiles[0];
}

function sourceById(id) {
  return officialSources.find((source) => source.id === id) ?? officialSources[0];
}

function render() {
  const result = scoreApplication(state);
  const profile = selectedProfile();
  const source = sourceById(profile.sourceId);

  document.querySelector('#app').innerHTML = `
    <main>
      <section class="hero">
        <div>
          <p class="eyebrow">India → Schengen document readiness MVP</p>
          <h1>Pre-check Schengen tourist visa documents before users pay, book, or submit.</h1>
          <p class="lede">This agent combines official-source checklists, deterministic risk scoring, and AI-review hooks to provide a ₹500 readiness report with document-level feedback. It is not a visa guarantee or legal advice.</p>
          <div class="hero-actions">
            <a class="button" href="#checker">Try the checker</a>
            <a class="button secondary" href="#plan">View build plan</a>
          </div>
        </div>
        <aside class="score-card" aria-live="polite">
          <span class="score-label">Readiness score</span>
          <strong>${result.score}</strong>
          <span class="band">${result.band}</span>
          <p>Risk adjustment: -${result.tripRisk}; history adjustment: ${result.historyBoost >= 0 ? '+' : ''}${result.historyBoost}</p>
        </aside>
      </section>

      <section id="checker" class="grid two-columns">
        <form class="panel" id="readiness-form">
          <h2>Applicant and trip details</h2>
          ${selectField('destination', 'Main destination', countryReadinessProfiles.map((profile) => profile.country), state.destination)}
          ${numberField('tripDays', 'Trip duration in days', state.tripDays)}
          ${numberField('leadDays', 'Days until intended travel', state.leadDays)}
          ${numberField('availableFundsInr', 'Available liquid funds (INR)', state.availableFundsInr)}
          ${selectField('priorSchengenVisa', 'Prior Schengen result', ['none', 'approved', 'refused'], state.priorSchengenVisa)}
          ${selectField('travelHistory', 'Travel history strength', ['none', 'some', 'strong'], state.travelHistory)}
          ${checkboxField('mainDestinationMismatch', 'Itinerary may not match the selected consulate', state.mainDestinationMismatch)}
          ${checkboxField('unexplainedDeposits', 'Bank statements include unexplained large deposits', state.unexplainedDeposits)}
        </form>

        <section class="panel">
          <h2>Country guidance snapshot</h2>
          <p>${profile.notes}</p>
          <div class="source-card">
            <span>${source.country}</span>
            <a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>
            <small>Last checked: ${source.checkedAt}</small>
          </div>
          <h3>Source refresh design</h3>
          <p>${OFFICIAL_SOURCE_REFRESH_POLICY.cadence}</p>
          <p><strong>Human review rule:</strong> ${OFFICIAL_SOURCE_REFRESH_POLICY.reviewRule}</p>
        </section>
      </section>

      <section class="panel">
        <h2>Document review</h2>
        <div class="documents">
          ${documentRules.map((rule) => documentRow(rule, result.details.find((item) => item.id === rule.id))).join('')}
        </div>
      </section>

      <section class="grid two-columns">
        <section class="panel">
          <h2>Priority feedback</h2>
          <ol class="actions">
            ${result.nextActions.map((action) => `<li>${action}</li>`).join('') || '<li>All critical checks look strong for this simulated pre-check.</li>'}
          </ol>
        </section>
        <section id="plan" class="panel">
          <h2>Build plan</h2>
          <ol class="roadmap">
            <li><strong>MVP:</strong> upload flow, checklist scoring, ₹500 payment, PDF readiness report, and admin source registry.</li>
            <li><strong>GuidelineOps agent:</strong> crawl only official EU, embassy, consulate, VFS/BLS/TLS sources; diff changes; route material changes to reviewers.</li>
            <li><strong>AI document checks:</strong> OCR for dates/names/balances, consistency checks, fraud red flags, and country-specific checklist matching.</li>
            <li><strong>Learning layer:</strong> collect consented anonymised outcomes, calibrate scores by destination/jurisdiction/purpose, and avoid protected-attribute targeting.</li>
            <li><strong>Compliance:</strong> DPDP-ready consent, data retention controls, encryption, audit logs, no acceptance guarantees, and human escalation for low scores.</li>
          </ol>
        </section>
      </section>

      <section class="panel">
        <h2>Official sources tracked by the agent</h2>
        <div class="sources">
          ${officialSources.map((trackedSource) => `
            <article>
              <h3>${trackedSource.country}</h3>
              <a href="${trackedSource.url}" target="_blank" rel="noreferrer">${trackedSource.title}</a>
              <small>Checked ${trackedSource.checkedAt}</small>
              <ul>${trackedSource.keyFacts.map((fact) => `<li>${fact}</li>`).join('')}</ul>
            </article>
          `).join('')}
        </div>
      </section>
    </main>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      setState({ [target.dataset.field]: target.type === 'number' ? Number(value) : value });
    });
  });

  document.querySelectorAll('[data-doc]').forEach((input) => {
    input.addEventListener('change', (event) => {
      const target = event.target;
      setState({ documents: { [target.dataset.doc]: target.value } });
    });
  });
}

function selectField(id, label, options, value) {
  return `<label>${label}<select data-field="${id}">${options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${titleCase(option)}</option>`).join('')}</select></label>`;
}

function numberField(id, label, value) {
  return `<label>${label}<input data-field="${id}" type="number" min="0" value="${value}" /></label>`;
}

function checkboxField(id, label, checked) {
  return `<label class="checkbox"><input data-field="${id}" type="checkbox" ${checked ? 'checked' : ''} />${label}</label>`;
}

function documentRow(rule, detail) {
  return `
    <article class="document-row ${detail.status}">
      <div>
        <h3>${rule.label}</h3>
        <p>${detail.feedback}</p>
        <small>${rule.checks.join(' ')}</small>
      </div>
      <div class="document-score">
        <strong>${detail.score}/${detail.maxScore}</strong>
        <select data-doc="${rule.id}" aria-label="${rule.label} status">
          ${['missing', 'needsReview', 'strong'].map((status) => `<option value="${status}" ${status === detail.status ? 'selected' : ''}>${titleCase(status)}</option>`).join('')}
        </select>
      </div>
    </article>
  `;
}

function titleCase(value) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

render();
