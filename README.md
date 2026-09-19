# Perlego curiosity onboarding prototype

A desktop-first, dependency-free hackathon prototype that helps an exploring student move from a vague question to several meaningful directions, contextual book discovery and a saved trail.

## Run locally

```bash
npm run dev
```

Open `http://localhost:4173`. State is stored in `localStorage`; clear the `perlego-curiosity-state-v1` key to reset the demo.

## Product structure

- One application shell moves between entry, exploration, reflection, simulated authentication/payment and reader hand-off states.
- `src/data/books.js` is the local 30-book catalogue.
- `src/lib/trails.js` holds deterministic interpretation, direction and activation logic.
- Activation means exploring at least two distinct directions and saving a book, topic or trail.

The core demo does not use an external API. Cover URLs progressively fall back to generated book spines if an image cannot load.
