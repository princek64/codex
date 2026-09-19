import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretQuery, booksForDirection, isActivated } from './trails.js';

test('maps the primary demo query to four grounded directions', () => {
  const result = interpretQuery('Why do humans make bad decisions?');
  assert.equal(result.key, 'decisions');
  assert.equal(result.directions.length, 4);
  assert.equal(booksForDirection(result.directions[0])[0].title, 'Thinking, Fast and Slow');
});

test('recognises books and authors as exploration starts', () => {
  assert.equal(interpretQuery('Thinking, Fast and Slow').startBook.id, 'thinking-fast-and-slow');
  assert.equal(interpretQuery('Daniel Kahneman').startBook.id, 'thinking-fast-and-slow');
});

test('activation requires divergent exploration and a save', () => {
  assert.equal(isActivated({ exploredDirectionIds: ['one','two'], savedItems: [{ id: 'x' }], savedTrail: false }), true);
  assert.equal(isActivated({ exploredDirectionIds: ['one'], savedItems: [{ id: 'x' }], savedTrail: false }), false);
});
