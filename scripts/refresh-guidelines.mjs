import { writeFile } from 'node:fs/promises';
import { officialSources } from '../src/data/guidelines.js';

const results = [];

for (const source of officialSources) {
  const startedAt = new Date().toISOString();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const response = await fetch(source.url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'SchengenReadinessGuidelineOps/0.1 (+https://example.invalid)',
      },
    });
    clearTimeout(timeout);
    results.push({
      id: source.id,
      url: source.url,
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type'),
      lastModified: response.headers.get('last-modified'),
      checkedAt: startedAt,
    });
  } catch (error) {
    results.push({
      id: source.id,
      url: source.url,
      ok: false,
      error: error.message,
      checkedAt: startedAt,
    });
  }
}

await writeFile('guideline-refresh-report.json', `${JSON.stringify(results, null, 2)}\n`);

const failed = results.filter((result) => !result.ok);
console.log(`Checked ${results.length} official source URLs; ${failed.length} require retry or review.`);

if (failed.length === results.length) {
  console.error('All source checks failed. Verify network/proxy access before trusting refresh status.');
  process.exitCode = 1;
}
