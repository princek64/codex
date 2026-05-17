import { documentRules } from '../data/guidelines.js';

const STATUS_MULTIPLIER = {
  strong: 1,
  needsReview: 0.55,
  missing: 0,
};

const FEEDBACK = {
  missing: 'Missing document. Add this before booking/submitting because it is commonly required for Schengen tourist applications.',
  needsReview: 'Needs review. Upload a clearer/current version and check consistency with trip dates, passport details, funds, and purpose.',
  strong: 'Looks strong for a pre-check. Final acceptance still depends on the consulate and verified originals.',
};

export function scoreApplication(formState) {
  const details = documentRules.map((rule) => {
    const status = formState.documents?.[rule.id] ?? 'missing';
    const score = Math.round(rule.weight * STATUS_MULTIPLIER[status]);
    return {
      ...rule,
      status,
      score,
      maxScore: rule.weight,
      feedback: FEEDBACK[status],
    };
  });

  const baseScore = details.reduce((sum, item) => sum + item.score, 0);
  const tripRisk = calculateTripRisk(formState);
  const historyBoost = calculateHistoryBoost(formState);
  const score = clamp(Math.round(baseScore - tripRisk + historyBoost), 0, 100);

  return {
    score,
    band: scoreBand(score),
    tripRisk,
    historyBoost,
    details,
    nextActions: buildNextActions(details, score, formState),
  };
}

function calculateTripRisk(formState) {
  let risk = 0;
  const days = Number(formState.tripDays || 0);
  const leadDays = Number(formState.leadDays || 0);
  const budget = Number(formState.availableFundsInr || 0);

  if (days > 30) risk += 7;
  if (days > 60) risk += 8;
  if (leadDays < 15) risk += 10;
  if (leadDays > 180) risk += 5;
  if (days > 0 && budget / days < 9000) risk += 8;
  if (formState.mainDestinationMismatch) risk += 12;
  if (formState.unexplainedDeposits) risk += 9;

  return risk;
}

function calculateHistoryBoost(formState) {
  let boost = 0;
  if (formState.priorSchengenVisa === 'approved') boost += 6;
  if (formState.priorSchengenVisa === 'refused') boost -= 10;
  if (formState.travelHistory === 'strong') boost += 4;
  if (formState.travelHistory === 'none') boost -= 4;
  return boost;
}

function buildNextActions(details, score, formState) {
  const weakDocs = details.filter((item) => item.status !== 'strong').slice(0, 4);
  const actions = weakDocs.map((item) => `Improve ${item.label}: ${item.checks[0]}`);

  if (Number(formState.leadDays || 0) < 15) {
    actions.push('Your appointment/submission appears inside the EU common 15-day minimum window; consider rescheduling if possible.');
  }
  if (formState.mainDestinationMismatch) {
    actions.push('Fix main-destination logic: apply through the country where you spend the longest stay, or first entry when stays are equal.');
  }
  if (score < 70) {
    actions.push('Do not position this as a guarantee. Use it as a document-readiness review and add a human expert review before submission.');
  }

  return actions;
}

function scoreBand(score) {
  if (score >= 85) return 'High readiness';
  if (score >= 70) return 'Moderate readiness';
  if (score >= 50) return 'Low readiness';
  return 'Critical gaps';
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
