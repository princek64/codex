import { books, bookById } from './data/books.js';
import { PRESETS, booksForDirection, contextReason, interpretQuery, isActivated } from './lib/trails.js';

const STORAGE_KEY = 'perlego-curiosity-state-v1';
const icons = {
  logo: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 3h17a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H5V3Zm6 6v14h8a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-8Z"/></svg>`,
  arrow: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
  bookmark: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3.5h10v14L10 14l-5 3.5v-14Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  close: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  search: `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m13 13 4 4" stroke="currentColor" stroke-width="1.6"/></svg>`,
};

const defaultState = {
  view: 'home', query: '', result: null, currentDirectionId: null, currentTopic: null,
  exploredDirectionIds: [], foundBookIds: [], savedItems: [], savedTrail: false,
  signedUp: false, subscribed: false, previewBookId: null, authIntent: null,
  toast: '', error: '', bookMode: false, readerBookId: null, branchPrompt: '',
};
let state = loadState();
let loadingTimers = [];

function loadState() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'), previewBookId: null, toast: '', error: '' }; }
  catch { return { ...defaultState }; }
}
function persist() {
  const { previewBookId, toast, error, ...saved } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}
function setState(patch, { save = true } = {}) {
  state = { ...state, ...patch };
  if (save) persist();
  render();
}
function announce(message) {
  state.toast = message; render();
  window.setTimeout(() => { if (state.toast === message) { state.toast = ''; render(); } }, 2400);
}
function esc(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function currentDirection() { return state.result?.directions.find((d) => d.id === state.currentDirectionId); }

function render() {
  const app = document.querySelector('#app');
  app.innerHTML = `${header()}<main>${view()}</main>${state.previewBookId ? previewPanel(bookById(state.previewBookId)) : ''}${state.toast ? `<div class="toast" role="status">${esc(state.toast)}</div>` : ''}`;
  bindEvents();
}

function header() {
  const inJourney = !['home','returning'].includes(state.view);
  return `<header class="site-header">
    <button class="brand" data-action="home" aria-label="Perlego home">${icons.logo}<span>Perlego</span></button>
    ${inJourney ? `<div class="header-question"><span>Exploring</span><strong>${esc(state.query)}</strong></div>` : '<p class="header-note">Books for curious minds</p>'}
    <div class="header-actions">${inJourney ? `<button class="text-button" data-action="new">Start a new curiosity</button>` : ''}<button class="icon-button" data-action="help" aria-label="About this prototype">?</button></div>
  </header>`;
}

function view() {
  if (state.readerBookId) return readerView();
  if (state.view === 'loading') return loadingView();
  if (state.view === 'explore') return exploreView();
  if (state.view === 'reflection') return reflectionView();
  if (state.view === 'auth') return authView();
  if (state.view === 'payment') return paymentView();
  if (state.view === 'welcome') return welcomeView();
  if (state.view === 'returning') return returningView();
  return homeView();
}

function homeView() {
  return `<section class="entry">
    <div class="entry-copy"><p class="eyebrow">A library for following ideas</p><h1>Where will your<br>curiosity take you?</h1><p class="lede">Start with anything that’s been on your mind.</p></div>
    <form id="curiosity-form" class="curiosity-form" novalidate>
      <label for="curiosity">What are you curious about?</label>
      <div class="input-shell ${state.error ? 'has-error' : ''}">${icons.search}<textarea id="curiosity" name="curiosity" rows="2" maxlength="180" placeholder="Why do we procrastinate?">${esc(state.query)}</textarea><button class="primary" type="submit">Explore ${icons.arrow}</button></div>
      <div class="form-meta"><span class="error" role="alert">${esc(state.error)}</span><span id="query-count">${state.query.length}/180</span></div>
    </form>
    <div class="starters"><p>Not sure where to begin?</p><div>${Object.entries(PRESETS).map(([key,value]) => `<button data-preset="${key}">${key === 'nature' ? 'The natural world' : key === 'behaviour' ? 'Human behaviour' : key[0].toUpperCase()+key.slice(1)}</button>`).join('')}</div></div>
    <button class="book-start" data-action="book-mode">${icons.bookmark}<span><strong>Start with a book</strong><small>Search by title or author</small></span>${icons.arrow}</button>
    ${state.bookMode ? bookSearch() : ''}
  </section>`;
}

function bookSearch() {
  return `<div class="book-finder"><label for="book-query">Find a book or author</label><input id="book-query" autocomplete="off" placeholder="Try Thinking, Fast and Slow"><div id="book-matches"></div></div>`;
}

function loadingView() {
  const terms = state.result ? state.result.directions.slice(0,4).flatMap(d => d.labels).slice(0,4) : [];
  return `<section class="loading-view" aria-live="polite"><div class="loading-mark">${icons.logo}<i></i></div><p class="eyebrow">Looking across Perlego…</p><h1>Connecting your question</h1><div class="loading-terms">${terms.map((term,i) => `<span style="--delay:${i*100}ms">${esc(term)}</span>`).join('')}</div></section>`;
}

function exploreView() {
  const direction = currentDirection();
  const activated = isActivated(state);
  return `<div class="workspace">
    <aside class="trail-rail">
      <div><p class="eyebrow">Your trail</p><button class="trail-root" data-action="root"><i></i><span>${esc(state.query)}</span></button>
      ${direction ? `<div class="trail-line"></div><button class="trail-node active" data-direction="${direction.id}"><i></i><span>${esc(direction.title)}</span></button>${state.currentTopic ? `<div class="trail-line"></div><button class="trail-node topic"><i></i><span>${esc(state.currentTopic)}</span></button>` : ''}` : ''}</div>
      <div class="trail-save"><p>${new Set(state.exploredDirectionIds).size} direction${new Set(state.exploredDirectionIds).size === 1 ? '' : 's'} explored</p><button class="secondary wide" data-action="save-trail">${state.savedTrail ? 'Trail saved' : 'Save this trail'}</button>${activated ? '<small>Your trail is ready to keep.</small>' : '<small>Explore another direction to see the bigger picture.</small>'}</div>
    </aside>
    <section class="canvas">${direction ? directionDetail(direction) : directionOverview()}</section>
  </div>`;
}

function directionOverview() {
  return `<div class="canvas-head reveal"><p class="eyebrow">You started with</p><h1>${esc(state.query)}</h1><p>${esc(state.result.message)}</p></div>
    ${state.result.startBook ? `<button class="start-book" data-preview="${state.result.startBook.id}"><span>Known book</span><strong>${esc(state.result.startBook.title)}</strong><small>Use this as the start, not the answer ${icons.arrow}</small></button>` : ''}
    <div class="direction-grid">${state.result.directions.map((d,i) => directionCard(d,i)).join('')}</div>
    ${state.exploredDirectionIds.length ? `<div class="return-note"><span>You can branch without losing what you have already explored.</span></div>` : ''}`;
}

function directionCard(d, index) {
  const explored = state.exploredDirectionIds.includes(d.id);
  return `<button class="direction-card reveal" style="--delay:${index*65}ms" data-direction="${d.id}"><div class="direction-number">0${index+1}</div><div><h2>${esc(d.title)}</h2><p>${esc(d.description)}</p><div class="tags">${d.labels.map(label => `<span>${esc(label)}</span>`).join('')}</div></div><footer><span>${d.bookIds.length} books to begin with</span>${explored ? '<b>Explored</b>' : icons.arrow}</footer></button>`;
}

function directionDetail(direction) {
  const directionBooks = booksForDirection(direction);
  const topics = direction.labels.slice(0,3);
  const others = state.result.directions.filter(d => d.id !== direction.id && !state.exploredDirectionIds.includes(d.id));
  return `<button class="back-link" data-action="root">← All directions</button>
    <div class="detail-head reveal"><p class="eyebrow">A direction from your question</p><h1>${esc(direction.title)}</h1><p>${esc(direction.description)}</p><button class="save-topic ${saved('topic',direction.id) ? 'is-saved' : ''}" data-save-topic="${direction.id}">${icons.bookmark}${saved('topic',direction.id) ? 'Saved' : 'Save direction'}</button></div>
    <section class="deeper"><h2>Three ways to go deeper</h2><div class="topic-list">${topics.map((t,i) => `<button class="topic-button ${state.currentTopic === t ? 'active' : ''}" data-topic="${esc(t)}"><span>0${i+1}</span>${esc(t)}${icons.arrow}</button>`).join('')}</div></section>
    <section class="books-section"><div class="section-heading"><div><p class="eyebrow">Books behind the idea</p><h2>${state.currentTopic ? `Read into ${esc(state.currentTopic.toLowerCase())}` : 'A place to begin'}</h2></div><p>Every book is from the Perlego sample library.</p></div><div class="book-grid">${directionBooks.map((book,i) => bookCard(book,direction,i)).join('')}</div></section>
    ${directionBooks.length === 0 ? noBooksState() : ''}
    ${others.length ? `<section class="perspective"><div><p class="eyebrow">Another way to look at this</p><h2>Want another perspective?</h2><p>You explored ${esc(direction.title.toLowerCase())}. Try ${esc(others[0].title.toLowerCase())} without losing this branch.</p></div><button class="secondary" data-direction="${others[0].id}">Explore ${esc(others[0].title)} ${icons.arrow}</button></section>` : `<section class="perspective"><div><h2>You have looked at every direction</h2><p>Keep this trail so you can return to the connections you found.</p></div><button class="primary" data-action="reflect">Review your trail</button></section>`}
    ${state.exploredDirectionIds.length >= 2 ? `<button class="reflection-prompt" data-action="reflect"><span><strong>You started with one question.</strong><small>See the directions and books you found.</small></span>${icons.arrow}</button>` : ''}`;
}

function bookCard(book, direction, index) {
  return `<article class="book-card reveal" style="--delay:${index*70}ms"><button class="cover-button" data-preview="${book.id}" aria-label="Preview ${esc(book.title)}">${coverImage(book)}</button><div class="book-copy"><p>${esc(book.category)}</p><h3>${esc(book.title)}</h3><span>${esc(book.author)}</span><p class="book-reason">${esc(book.description)}</p><div class="book-tags">${book.subtopics.slice(0,2).map(t => `<span>${esc(t)}</span>`).join('')}</div><footer><button class="text-button" data-preview="${book.id}">Preview book</button><button class="save-button ${saved('book',book.id) ? 'is-saved' : ''}" data-save-book="${book.id}" aria-label="${saved('book',book.id) ? 'Unsave' : 'Save'} ${esc(book.title)}">${icons.bookmark}${saved('book',book.id) ? 'Saved' : 'Save'}</button></footer></div></article>`;
}

function coverImage(book, large = false) {
  return `<div class="book-cover ${large ? 'large' : ''}"><img src="${book.cover_image_url}" alt="Cover of ${esc(book.title)}" data-cover-error><div class="cover-fallback"><span>${esc(book.title)}</span><small>${esc(book.author)}</small></div></div>`;
}
function noBooksState() { return `<div class="empty-state"><h3>No books sit directly behind this idea yet.</h3><p>Try a nearby direction rather than stopping here.</p><button class="secondary" data-action="root">See nearby ideas</button></div>`; }
function saved(type,id) { return state.savedItems.some(item => item.type === type && item.id === id); }

function previewPanel(book) {
  const direction = currentDirection();
  return `<div class="scrim" data-action="close-preview"></div><aside class="preview" role="dialog" aria-modal="true" aria-labelledby="preview-title"><button class="preview-close icon-button" data-action="close-preview" aria-label="Close preview">${icons.close}</button><div class="preview-top">${coverImage(book,true)}<div><p class="eyebrow">Book preview</p><h2 id="preview-title">${esc(book.title)}</h2><p>${esc(book.author)}</p><span>${book.publication_year} · About ${book.approximate_pages} pages</span></div></div><div class="preview-body"><p>${esc(book.description)}</p><div class="tags">${book.subtopics.map(t => `<span>${esc(t)}</span>`).join('')}</div><section class="why"><p class="eyebrow">Why this came up</p><p>${esc(contextReason(book,direction))}</p><div class="mini-trail">${esc(state.query)} <span>→</span> ${esc(direction?.title || book.subtopics[0])}</div></section></div><footer class="preview-actions"><button class="save-button ${saved('book',book.id) ? 'is-saved' : ''}" data-save-book="${book.id}">${icons.bookmark}${saved('book',book.id) ? 'Saved' : 'Save'}</button><button class="secondary" data-action="close-preview">Continue exploring</button><button class="primary" data-read="${book.id}">Start reading</button></footer></aside>`;
}

function reflectionView() {
  const explored = state.result.directions.filter(d => state.exploredDirectionIds.includes(d.id));
  const found = state.foundBookIds.map(bookById).filter(Boolean);
  return `<section class="reflection"><button class="back-link" data-action="back-explore">← Back to exploring</button><div class="reflection-intro"><p class="eyebrow">Your curiosity so far</p><h1>You started with one question.</h1><blockquote>${esc(state.query)}</blockquote></div><div class="reflection-columns"><section><p class="eyebrow">You explored</p>${explored.map(d => `<div class="summary-row"><i></i><span><strong>${esc(d.title)}</strong><small>${esc(d.labels[0])}</small></span></div>`).join('')}</section><section><p class="eyebrow">You found</p>${found.slice(0,4).map(b => `<div class="found-row">${coverImage(b)}<span><strong>${esc(b.title)}</strong><small>${esc(b.author)}</small></span></div>`).join('') || '<p>Preview a book to add it to this summary.</p>'}</section></div><div class="keep-card"><div><h2>This is worth returning to.</h2><p>Keep the question, the branches you followed and why each book appeared.</p></div><button class="primary" data-action="keep">Keep this trail ${icons.arrow}</button></div></section>`;
}

function authView() {
  return modalPage('Keep exploring from where you left off','Create an account to save this trail and access the books behind it.',`<button class="oauth" data-action="signup">Continue with Google</button><div class="or"><span>or</span></div><button class="primary wide" data-action="signup">Continue with email</button><button class="text-button centred" data-action="back-explore">Not now — keep exploring</button>`);
}
function paymentView() {
  return modalPage('Your trail is ready to continue.','Subscribe for full access to the books you found, with your exploration saved beside them.',`<ul class="benefits"><li>Unlimited access to Perlego books</li><li>Your questions, branches and saved books in one place</li><li>Reading tools, highlighting and notes</li></ul><div class="plan"><span>Perlego subscription</span><strong>Choose a plan on the next step</strong><small>Prototype payment — no charge will be made.</small></div><button class="primary wide" data-action="subscribe">Continue with subscription</button><button class="text-button centred" data-action="back-explore">Return to your trail</button>`);
}
function modalPage(title,copy,content) { return `<section class="intent-page"><div class="intent-context"><p class="eyebrow">Saved from your exploration</p><h2>${esc(state.query)}</h2><div class="mini-trail">${state.result?.directions.filter(d => state.exploredDirectionIds.includes(d.id)).map(d => esc(d.title)).join(' → ')}</div></div><div class="intent-card">${icons.logo}<h1>${title}</h1><p>${copy}</p>${content}</div></section>`; }

function welcomeView() {
  const book = bookById(state.foundBookIds[0]) || booksForDirection(state.result.directions[0])[0];
  return `<section class="welcome"><div><p class="eyebrow">Welcome back to your trail</p><h1>${esc(state.query)}</h1><p>You can continue from exactly where your curiosity led you.</p></div><div class="welcome-path">${state.result.directions.filter(d => state.exploredDirectionIds.includes(d.id)).map(d => `<span>${esc(d.title)}</span>`).join(icons.arrow)}</div><article class="resume-book">${coverImage(book,true)}<div><p class="eyebrow">Ready to read</p><h2>${esc(book.title)}</h2><p>${esc(book.author)}</p><div><button class="primary" data-read="${book.id}">Start reading</button><button class="secondary" data-action="back-explore">Keep exploring</button></div></div></article></section>`;
}

function returningView() {
  const explored = state.result?.directions.filter(d => state.exploredDirectionIds.includes(d.id)) || [];
  return `<section class="returning"><div><p class="eyebrow">Good to see you again</p><h1>Pick up where your<br>curiosity left off.</h1></div><article class="return-card"><p class="eyebrow">Saved trail</p><h2>${esc(state.query)}</h2><div class="return-path">${explored.slice(0,3).map(d=>`<span>${esc(d.title)}</span>`).join(icons.arrow)}</div><div><span>${state.savedItems.filter(i=>i.type==='book').length} saved books · ${explored.length} explored directions</span><button class="primary" data-action="resume">Continue trail ${icons.arrow}</button></div></article><button class="text-button" data-action="new">Start a new curiosity</button></section>`;
}

function readerView() {
  const book = bookById(state.readerBookId);
  return `<section class="reader"><div class="reader-toolbar"><button class="brand" data-action="exit-reader">${icons.logo}<span>Perlego reader</span></button><span>${esc(book.title)}</span><button class="text-button">Aa</button></div><div class="reader-banner"><span><strong>From your curiosity trail:</strong> You chose this book while exploring ${esc(currentDirection()?.title.toLowerCase() || book.subtopics[0].toLowerCase())}.</span><button class="icon-button" data-action="dismiss-banner">${icons.close}</button></div><article><p>Preview</p><h1>${esc(book.title)}</h1><h2>${esc(book.author)}</h2><div class="chapter-line"></div><p>${esc(book.description)} This lightweight view represents entry into the existing Perlego reader. Your trail remains available when you leave.</p></article></section>`;
}

function bindEvents() {
  document.querySelector('#curiosity-form')?.addEventListener('submit', (event) => { event.preventDefault(); startQuery(document.querySelector('#curiosity').value); });
  document.querySelector('#curiosity')?.addEventListener('input', (event) => { state.query = event.target.value; document.querySelector('#query-count').textContent = `${event.target.value.length}/180`; if (state.error) { state.error=''; document.querySelector('.error').textContent=''; } });
  document.querySelectorAll('[data-action]').forEach(el => el.addEventListener('click', () => action(el.dataset.action)));
  document.querySelectorAll('[data-preset]').forEach(el => el.addEventListener('click', () => startQuery(PRESETS[el.dataset.preset])));
  document.querySelectorAll('[data-direction]').forEach(el => el.addEventListener('click', () => chooseDirection(el.dataset.direction)));
  document.querySelectorAll('[data-topic]').forEach(el => el.addEventListener('click', () => setState({ currentTopic: el.dataset.topic })));
  document.querySelectorAll('[data-preview]').forEach(el => el.addEventListener('click', () => { const id=el.dataset.preview; const found=[...new Set([...state.foundBookIds,id])]; setState({ previewBookId:id, foundBookIds:found },{save:true}); window.setTimeout(()=>document.querySelector('.preview-close')?.focus(),30); }));
  document.querySelectorAll('[data-save-book]').forEach(el => el.addEventListener('click', () => toggleSave('book',el.dataset.saveBook)));
  document.querySelectorAll('[data-save-topic]').forEach(el => el.addEventListener('click', () => toggleSave('topic',el.dataset.saveTopic)));
  document.querySelectorAll('[data-read]').forEach(el => el.addEventListener('click', () => readBook(el.dataset.read)));
  document.querySelectorAll('[data-cover-error]').forEach(img => img.addEventListener('error',()=>img.classList.add('failed')));
  const bookQuery = document.querySelector('#book-query'); if (bookQuery) bookQuery.addEventListener('input', () => renderBookMatches(bookQuery.value));
  document.addEventListener('keydown', escapePreview, { once: true });
}

function escapePreview(event) { if (event.key === 'Escape' && state.previewBookId) setState({previewBookId:null},{save:false}); }
function startQuery(raw) {
  const query = raw.trim();
  if (!query) { setState({ error:'Give us a question, idea or topic — it doesn’t need to be specific.' },{save:false}); document.querySelector('#curiosity')?.focus(); return; }
  const result = interpretQuery(query);
  setState({ ...defaultState, view:'loading', query, result, signedUp:state.signedUp, subscribed:state.subscribed });
  loadingTimers.forEach(clearTimeout); loadingTimers=[setTimeout(()=>setState({view:'explore'}),1050)];
}
function chooseDirection(id) {
  const explored=[...new Set([...state.exploredDirectionIds,id])];
  const direction=state.result.directions.find(d=>d.id===id);
  const found=[...new Set([...state.foundBookIds,...(direction?.bookIds||[])])];
  setState({ currentDirectionId:id, currentTopic:null, exploredDirectionIds:explored, foundBookIds:found, view:'explore' });
}
function toggleSave(type,id) {
  const exists=saved(type,id);
  if (exists) { setState({savedItems:state.savedItems.filter(item=>!(item.type===type&&item.id===id))}); announce('Removed from your trail. Undo'); }
  else {
    const direction=currentDirection();
    const item={type,id,savedFrom:[state.query,direction?.title,state.currentTopic].filter(Boolean),reason:type==='book'?contextReason(bookById(id),direction):direction?.description};
    setState({savedItems:[...state.savedItems,item]}); announce('Saved to your trail');
  }
}
function readBook(id) { if (!state.subscribed) setState({previewBookId:null,authIntent:id,view:state.signedUp?'payment':'auth'}); else setState({previewBookId:null,readerBookId:id}); }
function renderBookMatches(raw) {
  const q=raw.trim().toLowerCase(); const matches=q.length<2?[]:books.filter(b=>`${b.title} ${b.author}`.toLowerCase().includes(q)).slice(0,5);
  document.querySelector('#book-matches').innerHTML=matches.length?matches.map(b=>`<button data-book-result="${b.id}"><strong>${esc(b.title)}</strong><span>${esc(b.author)}</span></button>`).join(''):q.length>=2?'<p>No close title or author match. Try a topic above.</p>':'';
  document.querySelectorAll('[data-book-result]').forEach(el=>el.addEventListener('click',()=>startQuery(bookById(el.dataset.bookResult).title)));
}
function action(name) {
  if (name==='home') { state.savedTrail||state.savedItems.length ? setState({view:'returning',readerBookId:null,previewBookId:null}) : setState({...defaultState,signedUp:state.signedUp,subscribed:state.subscribed}); }
  if (name==='help') announce('A hackathon prototype using Perlego’s sample library.');
  if (name==='book-mode') setState({bookMode:!state.bookMode},{save:false});
  if (name==='root') setState({currentDirectionId:null,currentTopic:null,view:'explore'});
  if (name==='back-explore'||name==='resume') setState({view:'explore',readerBookId:null});
  if (name==='close-preview') setState({previewBookId:null},{save:false});
  if (name==='reflect') setState({view:'reflection'});
  if (name==='save-trail'||name==='keep') { if (state.savedTrail) { announce('Already saved'); return; } setState({savedTrail:true,view:state.signedUp?'payment':'auth'}); }
  if (name==='signup') setState({signedUp:true,view:'payment'});
  if (name==='subscribe') setState({subscribed:true,view:'welcome'});
  if (name==='new') { if (confirm('Start a new curiosity? Your saved trail will stay here.')) setState({...defaultState,signedUp:state.signedUp,subscribed:state.subscribed,savedItems:state.savedItems,savedTrail:state.savedTrail}); }
  if (name==='exit-reader') setState({readerBookId:null,view:'welcome'});
  if (name==='dismiss-banner') document.querySelector('.reader-banner')?.remove();
}

if ((state.savedTrail || state.savedItems.length) && state.view === 'home') state.view='returning';
render();
