import test from 'node:test';
import assert from 'node:assert/strict';
import { documentRules } from '../data/guidelines.js';
import { scoreApplication } from './scoring.js';

const strongDocuments = Object.fromEntries(documentRules.map((rule) => [rule.id, 'strong']));
const missingDocuments = Object.fromEntries(documentRules.map((rule) => [rule.id, 'missing']));

test('scores a strong application as high readiness', () => {
  const result = scoreApplication({
    tripDays: 10,
    leadDays: 40,
    availableFundsInr: 200000,
    priorSchengenVisa: 'approved',
    travelHistory: 'strong',
    documents: strongDocuments,
  });

  assert.equal(result.score, 100);
  assert.equal(result.band, 'High readiness');
});

test('penalises missing documents and trip-level red flags', () => {
  const result = scoreApplication({
    tripDays: 65,
    leadDays: 7,
    availableFundsInr: 100000,
    priorSchengenVisa: 'refused',
    travelHistory: 'none',
    mainDestinationMismatch: true,
    unexplainedDeposits: true,
    documents: missingDocuments,
  });

  assert.equal(result.score, 0);
  assert.equal(result.band, 'Critical gaps');
  assert.ok(result.nextActions.some((action) => action.includes('main-destination')));
});
