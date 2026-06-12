# Champion Brew

Champion Brew is a Next.js MVP for specialty coffee drinkers who want to recreate champion-style pour-over recipes. The MVP uses fictional placeholder recipes, mock live scale data, and a database-ready Prisma schema that can later be connected to licensed recipe data.

> Legal/data note: the included recipes are fictional champion-style placeholders. Do not represent them as real champion recipes unless the data is sourced or licensed.

## Features

- Premium mobile-first home screen with Start brewing and Browse recipes CTAs.
- Bean and recipe browsing with filters for origin, process, and roast.
- Recipe detail pages with overview, equipment, steps, and target curve preview.
- Live brew session with timer, simulated scale weight, flow rate, target vs user curve, and real-time guidance.
- Brew result screen with accuracy score, timing match, weight match, flow stability, and notes.
- Modular scale provider interface with Acaia, Felicita, Timemore placeholders and a mock provider.
- Prisma schema for future database persistence.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm test
npm run build
```
