/**
 * populate-logos.ts
 *
 * Looks up company domains via the Clearbit autocomplete API and populates
 * domainNamePrimaryLinkUrl (companies) and websitePrimaryLinkUrl (account groups).
 *
 * Usage:
 *   npx tsx scripts/populate-logos.ts [options]
 *
 * Options:
 *   --env <uat|prod>          Database to update (default: uat)
 *   --target <companies|groups|both>  Which records to process (default: both)
 *   --limit <N>               Only process the first N records
 *   --dry-run                 Print matches without updating the database
 *   --skip-confirmed          Skip records that already have a domain/website set
 *
 * Examples:
 *   # Preview first 10 company matches against UAT, no DB changes
 *   npx tsx scripts/populate-logos.ts --dry-run --limit 10 --target companies
 *
 *   # Preview all account group matches
 *   npx tsx scripts/populate-logos.ts --dry-run --target groups
 *
 *   # Apply to first 20 companies on UAT
 *   npx tsx scripts/populate-logos.ts --limit 20 --target companies --env uat
 *
 *   # Apply everything to production
 *   npx tsx scripts/populate-logos.ts --target both --env prod
 */

import { Client } from 'pg';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// DB connection strings — read passwords from env vars at run-time so they
// never get committed. Set these in your shell config (rotate via Railway):
//   export TWENTY_UAT_DB_PASSWORD=$(railway variables --kv --service Postgres --environment uat | sed -n 's/^POSTGRES_PASSWORD=//p')
//   export TWENTY_PROD_DB_PASSWORD=$(railway variables --kv --service Postgres --environment production | sed -n 's/^POSTGRES_PASSWORD=//p')
const UAT_PW = process.env.TWENTY_UAT_DB_PASSWORD;
const PROD_PW = process.env.TWENTY_PROD_DB_PASSWORD;
if (!UAT_PW || !PROD_PW) {
  console.error(
    'Set TWENTY_UAT_DB_PASSWORD and TWENTY_PROD_DB_PASSWORD env vars (see top of file)',
  );
  process.exit(1);
}
const DB_URLS: Record<string, string> = {
  uat: `postgresql://postgres:${UAT_PW}@tramway.proxy.rlwy.net:58786/railway`,
  prod: `postgresql://postgres:${PROD_PW}@centerbeam.proxy.rlwy.net:44530/railway`,
};

const WORKSPACE_SCHEMA = 'workspace_88pd7l5mqn69yo7kctctadczq';

// Clearbit autocomplete — free, no API key required.
const CLEARBIT_URL = 'https://autocomplete.clearbit.com/v1/companies/suggest?query=';

// Milliseconds to wait between Clearbit requests to be a good citizen.
const RATE_LIMIT_MS = 300;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };
  const has = (flag: string) => args.includes(flag);

  const env = get('--env') ?? 'uat';
  if (!['uat', 'prod'].includes(env)) {
    console.error(`--env must be "uat" or "prod", got: ${env}`);
    process.exit(1);
  }

  const target = get('--target') ?? 'both';
  if (!['companies', 'groups', 'both'].includes(target)) {
    console.error(`--target must be "companies", "groups", or "both", got: ${target}`);
    process.exit(1);
  }

  const limitRaw = get('--limit');
  const limit = limitRaw ? parseInt(limitRaw, 10) : undefined;
  if (limitRaw && isNaN(limit!)) {
    console.error(`--limit must be a number, got: ${limitRaw}`);
    process.exit(1);
  }

  return {
    env,
    target,
    limit,
    dryRun: has('--dry-run'),
    skipConfirmed: has('--skip-confirmed'),
  };
}

// ---------------------------------------------------------------------------
// Clearbit lookup
// ---------------------------------------------------------------------------

type ClearbitResult = { name: string; domain: string; logo: string };

// Strip location suffixes like " - London", " - Dublin", " (London)" before
// querying Clearbit, which doesn't know location-qualified company names.
function stripLocationSuffix(name: string): string {
  return name
    .replace(/\s*[-–—]\s*[A-Z][a-zA-Z\s,]+$/, '') // " - London", " - Abu Dhabi"
    .replace(/\s*\([^)]+\)\s*$/, '')               // " (London)", " (UK)"
    .trim();
}

async function lookupDomain(companyName: string): Promise<ClearbitResult | null> {
  const queryName = stripLocationSuffix(companyName);
  try {
    const url = `${CLEARBIT_URL}${encodeURIComponent(queryName)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const results: ClearbitResult[] = await res.json();
    if (results.length === 0) return null;

    // Filter to results whose name reasonably matches the query, then pick
    // the best domain. Prefer shorter/simpler domains (likely the parent
    // company HQ) and favour .com over country TLDs when quality is equal.
    const reasonable = results.filter((r) => isReasonableMatch(queryName, r.name));
    const candidates = reasonable.length > 0 ? reasonable : results.slice(0, 1);

    return pickBestCandidate(queryName, candidates);
  } catch {
    return null;
  }
}

// Pick the domain that looks most like the parent company's canonical domain.
function pickBestCandidate(
  queryName: string,
  candidates: ClearbitResult[],
): ClearbitResult {
  if (candidates.length === 1) return candidates[0];

  const qNorm = queryName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const score = (r: ClearbitResult): number => {
    const domain = normaliseDomain(r.domain);
    // Extract the domain stem (e.g. "allianzlife" from "allianzlife.com")
    const stem = domain.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const rNorm = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let s = 0;

    // Prefer shorter domains (HQ domain is usually simpler)
    s -= domain.length;

    // Strong bonus for .com
    if (domain.endsWith('.com')) s += 20;

    // Biggest bonus: domain stem is exactly the normalised query name
    // e.g. "allianz" → stem "allianz" from "allianz.com"
    if (stem === qNorm) s += 50;
    else if (stem.startsWith(qNorm) && stem.length <= qNorm.length + 3) s += 30;
    else if (qNorm.startsWith(stem) && stem.length >= 4) s += 20;
    // Penalty: stem has extra words beyond the query (subsidiary indicator)
    else if (stem.startsWith(qNorm) && stem.length > qNorm.length + 3) s -= 5;

    // Bonus: result company name closely matches query
    if (rNorm === qNorm) s += 25;
    else if (rNorm.startsWith(qNorm)) s += 10;

    // Penalty for obvious country-specific TLDs
    const countryTlds = /\.(co\.|com\.)?(au|nz|uk|fr|de|it|es|nl|pl|be|at|ch|se|no|dk|fi|ie|sg|jp|hk|in|br|mx|za|cl)$/;
    if (countryTlds.test(domain)) s -= 10;

    return s;
  };

  return candidates.reduce((best, c) => (score(c) > score(best) ? c : best));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Normalise a domain for storage — strip protocol and www prefix.
function normaliseDomain(raw: string): string {
  return raw.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

// High-confidence check: the domain stem should closely resemble the query name,
// and we should not be getting a country-specific TLD when a .com likely exists.
function isDomainHighConfidence(queryName: string, domain: string): boolean {
  const qNorm = queryName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const stem = domain.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

  // Domain stem must start with or equal the normalised query name.
  // For short abbreviations (≤ 4 chars) require an exact stem match to avoid
  // prefix false-positives like ASR → asrv.com or FIS → fiserv.com.
  const stemMatchesQuery =
    qNorm.length <= 4
      ? stem === qNorm
      : stem === qNorm || stem.startsWith(qNorm);

  // Penalise country-specific and non-standard TLDs.
  // Also catch country codes in the second-level position (e.g. higcapital.br.com).
  const domainParts = domain.split('.');
  // Penalise stems with extra words beyond the query (do this early so we can
  // reuse stemTooLong in the .co.uk fast-path below).
  const stemTooLong = stem.length > qNorm.length + 3;

  // .co.uk is explicitly allowed — many legitimate UK companies use it.
  if (/\.co\.uk$/.test(domain)) return stemMatchesQuery && !stemTooLong;

  const countryCodes = new Set([
    'au','nz','fr','de','it','es','nl','pl','be','at','ch',
    'se','no','dk','fi','ie','sg','jp','hk','in','br','mx','za',
    'cl','bg','ro','hu','cz','pt','gr','lu','eu','ru','tr','th',
    'id','ph','vn','tw','kr','ae','sa','eg','ng','ke','il','si',
    'hr','rs','sk','lt','lv','ee','is','ir','me','ua','by','uz',
    'kz','ge','am','az','md','mn','bd','pk','lk','np','mm','kh',
    'my','co',
  ]);
  const countryTld =
    countryCodes.has(domainParts[domainParts.length - 1]) ||
    (domainParts.length >= 3 && countryCodes.has(domainParts[domainParts.length - 2]));

  // Non-standard generic TLDs (.io, .app, .org, .net) are legitimate but
  // uncommon for large established companies — treat as low confidence.
  const nonStandardTld = /\.(io|app|org|net)$/.test(domain);

  return stemMatchesQuery && !countryTld && !nonStandardTld && !stemTooLong;
}

// Name similarity — accept if the significant words of either name appear in
// the other (handles "BNP Paribas" ↔ "BNP Paribas SA", "AIB" ↔ "AIB Group").
function isReasonableMatch(queryName: string, resultName: string): boolean {
  const tokens = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((t) => t.length > 2);
  const qTokens = tokens(queryName);
  const rTokens = tokens(resultName);
  if (qTokens.length === 0 || rTokens.length === 0) return false;
  // At least half the query tokens must appear in the result name (or vice versa)
  const overlap = qTokens.filter((t) => rTokens.some((r) => r.includes(t) || t.includes(r)));
  return overlap.length >= Math.ceil(Math.min(qTokens.length, rTokens.length) / 2);
}

// ANSI colours for terminal output
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

// ---------------------------------------------------------------------------
// Processing
// ---------------------------------------------------------------------------

type Record = { id: string; name: string; existingUrl: string | null };

async function processRecords(
  client: Client,
  records: Record[],
  table: string,
  urlColumn: string,
  opts: { dryRun: boolean; label: string },
) {
  const { dryRun, label } = opts;

  let matched = 0;
  let skipped = 0;
  let failed = 0;
  let updated = 0;

  console.log(`\n${CYAN}━━━ ${label} (${records.length} records) ━━━${RESET}\n`);

  for (const record of records) {
    const result = await lookupDomain(record.name);
    await sleep(RATE_LIMIT_MS);

    if (!result) {
      console.log(`  ${RED}✗ NO RESULT  ${RESET} ${record.name}`);
      failed++;
      continue;
    }

    const domain = normaliseDomain(result.domain);
    const queryName = stripLocationSuffix(record.name);
    const reasonable = isReasonableMatch(queryName, result.name);
    const highConf = reasonable && isDomainHighConfidence(queryName, domain);
    const confidence = highConf
      ? `${GREEN}✓ MATCH     ${RESET}`
      : reasonable
        ? `${YELLOW}? LOW CONF  ${RESET}`
        : `${YELLOW}? LOW CONF  ${RESET}`;

    console.log(
      `  ${confidence} ${record.name.padEnd(45)} ${DIM}→${RESET} ${domain.padEnd(35)} ${DIM}(Clearbit: "${result.name}")${RESET}`,
    );

    if (!highConf) {
      skipped++;
      continue;
    }

    matched++;

    if (!dryRun) {
      await client.query(
        `UPDATE ${WORKSPACE_SCHEMA}.${table} SET "${urlColumn}" = $1 WHERE id = $2`,
        [domain, record.id],
      );
      updated++;
    }
  }

  console.log(
    `\n  ${DIM}Results: ${GREEN}${matched} matched${RESET}${DIM}, ` +
    `${YELLOW}${skipped} low-confidence (skipped)${RESET}${DIM}, ` +
    `${RED}${failed} no result${RESET}${DIM}` +
    (dryRun ? `, 0 updated (dry run)` : `, ${updated} updated`) +
    `${RESET}`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();

  console.log(`\n${CYAN}populate-logos.ts${RESET}`);
  console.log(`  env:    ${opts.env}`);
  console.log(`  target: ${opts.target}`);
  console.log(`  limit:  ${opts.limit ?? 'all'}`);
  console.log(`  mode:   ${opts.dryRun ? `${YELLOW}DRY RUN${RESET} (no DB changes)` : `${GREEN}LIVE${RESET} (will update DB)`}`);

  const dbUrl = DB_URLS[opts.env];
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    // --- Companies ---
    if (opts.target === 'companies' || opts.target === 'both') {
      const whereClause = opts.skipConfirmed
        ? `WHERE "deletedAt" IS NULL AND ("domainNamePrimaryLinkUrl" IS NULL OR "domainNamePrimaryLinkUrl" = '')`
        : `WHERE "deletedAt" IS NULL`;
      const limitClause = opts.limit ? `LIMIT ${opts.limit}` : '';

      const { rows } = await client.query<Record>(
        `SELECT id, name, "domainNamePrimaryLinkUrl" AS "existingUrl"
         FROM ${WORKSPACE_SCHEMA}.company
         ${whereClause}
         ORDER BY name
         ${limitClause}`,
      );

      await processRecords(client, rows, 'company', 'domainNamePrimaryLinkUrl', {
        dryRun: opts.dryRun,
        label: 'Companies',
      });
    }

    // --- Account Groups ---
    if (opts.target === 'groups' || opts.target === 'both') {
      const whereClause = opts.skipConfirmed
        ? `WHERE "deletedAt" IS NULL AND ("websitePrimaryLinkUrl" IS NULL OR "websitePrimaryLinkUrl" = '')`
        : `WHERE "deletedAt" IS NULL`;
      const limitClause = opts.limit ? `LIMIT ${opts.limit}` : '';

      const { rows } = await client.query<Record>(
        `SELECT id, name, "websitePrimaryLinkUrl" AS "existingUrl"
         FROM ${WORKSPACE_SCHEMA}."_accountGroup"
         ${whereClause}
         ORDER BY name
         ${limitClause}`,
      );

      await processRecords(client, rows, '"_accountGroup"', 'websitePrimaryLinkUrl', {
        dryRun: opts.dryRun,
        label: 'Account Groups',
      });
    }
  } finally {
    await client.end();
  }

  console.log(`\n${DIM}Done.${RESET}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
