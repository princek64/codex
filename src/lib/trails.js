import { books, bookById } from '../data/books.js';

const directions = {
  decisions: [
    ['minds','Inside our minds','Biases, intuition and the shortcuts our brains take',['Cognitive biases','Intuition','Judgement'],['thinking-fast-and-slow','algorithms-to-live-by']],
    ['influence','How others influence us','Persuasion, social behaviour and the people around us',['Social influence','Persuasion','Behaviour'],['influence','contagious']],
    ['choices','Designing our choices','How environments and products shape decisions',['Choice architecture','Design','Behaviour'],['nudge','design-everyday-things','hooked']],
    ['beliefs','Why our beliefs differ','Morality, culture and the way we reason',['Moral psychology','Culture','Reasoning'],['righteous-mind','scout-mindset']],
  ],
  technology: [
    ['computing-choices','How machines choose','What algorithms can teach us about decisions',['Algorithms','Decision-making','Computer science'],['algorithms-to-live-by','thinking-fast-and-slow']],
    ['values','AI and human values','What it means to align machines with people',['Artificial intelligence','Ethics','Human values'],['alignment-problem','weapons-math-destruction']],
    ['systems-power','Algorithms and society','How automated systems distribute risk and power',['Algorithmic bias','Power','Public policy'],['weapons-math-destruction','master-switch']],
    ['designed-behaviour','Technology that shapes behaviour','Where product design meets psychology',['Human-centred design','Behaviour','Technology'],['design-everyday-things','nudge']],
  ],
  societies: [
    ['institutions','The institutions behind prosperity','How rules distribute opportunity and power',['Institutions','Development','Political power'],['why-nations-fail','power-broker']],
    ['geography','Geography and resources','How land, crops and disease altered history',['Geography','Civilisations','Environment'],['guns-germs-steel','sapiens']],
    ['exchange','Routes of exchange','How trade moves wealth, belief and power',['Trade routes','Empires','Culture'],['silk-roads','sapiens']],
  ],
  learning: [
    ['memory','How memory really works','Why retrieval and spacing beat rereading',['Memory','Study methods','Learning science'],['make-it-stick','how-learning-works']],
    ['habits','Make learning a habit','How environment and repetition support progress',['Habit formation','Motivation','Behaviour change'],['atomic-habits','make-it-stick']],
    ['open-mind','Think more clearly','How curiosity and intellectual humility improve reasoning',['Reasoning','Belief formation','Learning'],['scout-mindset','how-learning-works']],
  ],
  planet: [
    ['living-world','A changing living world','The human choices behind biodiversity loss',['Biodiversity','Climate change','Earth history'],['sixth-extinction','braiding-sweetgrass']],
    ['relationships-nature','Another relationship with nature','What Indigenous knowledge adds to ecology',['Indigenous knowledge','Ecology','Reciprocity'],['braiding-sweetgrass','thinking-in-systems']],
    ['energy','Energy and power','How climate, resources and politics interact',['Energy','Geopolitics','Climate'],['new-map','thinking-in-systems']],
  ],
  ideas: [
    ['spread','Why ideas spread','The social forces that make messages travel',['Social transmission','Communication','Influence'],['contagious','made-to-stick']],
    ['stick','Why some ideas last','How memory, story and simplicity help ideas survive',['Memorable ideas','Storytelling','Learning'],['made-to-stick','make-it-stick']],
    ['persuade','How ideas persuade','Why people say yes and change their minds',['Persuasion','Belief formation','Psychology'],['influence','scout-mindset']],
  ],
};

export const PRESETS = {
  behaviour: 'Why do humans make bad decisions?', technology: 'How is technology changing our decisions?',
  history: 'How do societies become powerful?', nature: 'What is happening to our planet?', learning: 'How can I learn better?',
  surprise: 'Why do some ideas spread?',
};

function serialise(rows) { return rows.map(([id,title,description,labels,bookIds]) => ({ id,title,description,labels,bookIds })); }

export function interpretQuery(raw) {
  const query = raw.trim().slice(0, 180);
  const lower = query.toLowerCase();
  const exactBook = books.find((b) => b.title.toLowerCase() === lower);
  const authorBooks = books.filter((b) => b.author.toLowerCase().includes(lower) && lower.length > 3);
  let key = 'decisions';
  let message = 'Your question could go in a few directions.';
  let startBook = null;
  if (exactBook) { startBook = exactBook; key = categoryKey(exactBook); message = `Start from ${exactBook.title}`; }
  else if (authorBooks.length) { startBook = authorBooks[0]; key = categoryKey(startBook); message = `${startBook.author} could take you in a few directions.`; }
  else if (/learn|study|memory|education/.test(lower)) key = 'learning';
  else if (/planet|climate|nature|earth|environment|energy/.test(lower)) key = 'planet';
  else if (/societ|civil|nation|power|history|empire/.test(lower)) key = 'societies';
  else if (/tech|artificial|\bai\b|algorithm|machine|computer/.test(lower)) key = 'technology';
  else if (/idea|spread|communication|message/.test(lower)) key = 'ideas';
  else if (['people','future','interesting stuff','interesting'].includes(lower)) { key = 'ideas'; message = 'That could go in a few interesting directions.'; }
  else if (!/decision|choice|think|mind|behavio|bias|human/.test(lower)) { key = 'ideas'; message = 'We don’t have a close match in this sample library yet. Try one of these nearby ideas.'; }
  return { query, key, message, startBook, directions: serialise(directions[key]) };
}

function categoryKey(book) {
  if (/Technology/.test(book.category)) return 'technology';
  if (/History/.test(book.category)) return 'societies';
  if (/Science/.test(book.category)) return 'planet';
  if (/Learning/.test(book.category)) return 'learning';
  return /Contagious|Made to Stick|Influence/.test(book.title) ? 'ideas' : 'decisions';
}

export function booksForDirection(direction) { return direction.bookIds.map(bookById).filter(Boolean); }

export function contextReason(book, direction) {
  const overlap = book.subtopics.filter((topic) => direction?.labels.some((label) => topic.toLowerCase().includes(label.toLowerCase()) || label.toLowerCase().includes(topic.toLowerCase())));
  const subject = overlap[0] || book.subtopics[0];
  return `You were exploring ${direction?.title?.toLowerCase() || 'a connected idea'}. This book looks at ${subject.toLowerCase()} through ${book.category.toLowerCase()}.`;
}

export function isActivated(state) {
  return new Set(state.exploredDirectionIds).size >= 2 && (state.savedItems.length > 0 || state.savedTrail);
}
