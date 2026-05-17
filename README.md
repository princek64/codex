# Schengen Visa Readiness Agent

A lightweight MVP for an India-to-Schengen tourist visa document pre-check product. The app lets an operator simulate applicant details, mark uploaded document quality, and generate a readiness score with document-level feedback.

## Product position

- **Customer:** Indian travellers applying for short-stay Schengen visas.
- **Price point:** ₹500 per pre-check report.
- **Promise:** document-readiness feedback, not visa approval prediction or legal advice.
- **Core risk controls:** official-source tracking, human review of material guideline changes, DPDP-ready consent, anonymised outcome learning, and no acceptance guarantees.

## Current MVP capabilities

1. Country-specific guidance snapshot for common destinations.
2. Official-source registry with checked dates and key facts.
3. Deterministic scoring engine for required tourist visa documents.
4. Trip-level risk adjustments for lead time, main-destination mismatch, trip length, funds, unexplained deposits, prior refusal, and travel history.
5. Priority feedback list for the weakest documents and application risks.
6. Static build pipeline that can be hosted on any basic web server.


## Preview and deployment

### Local preview

```bash
npm run build
npm run preview
```

Then open `http://localhost:4173` to test the built static app.

### GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`. To deploy it:

1. Push the branch to a GitHub repository.
2. In GitHub, go to **Settings → Pages → Build and deployment**.
3. Select **GitHub Actions** as the source.
4. Push to `main` or run the workflow manually.

The workflow builds `dist/`, uploads it as a Pages artifact, and publishes the URL from the `deploy` job.

### Netlify or Vercel

The repo also includes `netlify.toml` and `vercel.json`. Import the repository in either host, keep the build command as `npm run build`, and publish/output directory as `dist`.

## Guideline update workflow

Run:

```bash
npm run guidelines:refresh
```

The script checks tracked official URLs and writes `guideline-refresh-report.json`. In production, schedule it with a job runner, store historical snapshots, diff content changes, and require human approval before changing scoring weights.

## Development

```bash
npm run dev
npm test
npm run build
```

The app intentionally uses no third-party runtime dependencies because the package registry was unavailable in this environment. It is plain HTML, CSS, and JavaScript modules.
