/**
 * Script to fetch and display QA issues from Crowdin
 *
 * This script uses Crowdin's native QA checks API to:
 * - Fetch all QA issues detected by Crowdin
 * - Group and display them by category and language
 * - Provide actionable information for fixing
 *
 * Usage:
 *   CROWDIN_PERSONAL_TOKEN=xxx npx ts-node packages/twenty-utils/translation-qa-report.ts
 *
 * The token can be obtained from: https://twenty.crowdin.com/u/settings#api-key
 */

import * as fs from 'fs';
import * as path from 'path';

const CROWDIN_BASE_URL = 'https://twenty.api.crowdin.com/api/v2';
const CROWDIN_PROJECT_ID = 1;

type QACheck = {
  stringId: number;
  languageId: string;
  category: string;
  categoryDescription: string;
  validation: string;
  validationDescription: string;
  pluralId: number;
  text: string;
};

async function getToken(): Promise<string> {
  const token = process.env.CROWDIN_PERSONAL_TOKEN;

  if (!token) {
    console.error(
      'Error: CROWDIN_PERSONAL_TOKEN environment variable not set',
    );
    console.error(
      'Get your token from: https://twenty.crowdin.com/u/settings#api-key',
    );
    process.exit(1);
  }

  return token;
}

async function fetchAllQAChecks(token: string): Promise<QACheck[]> {
  const allChecks: QACheck[] = [];
  let offset = 0;
  const limit = 500;

  console.log('Fetching QA issues from Crowdin...');

  while (true) {
    const url = `${CROWDIN_BASE_URL}/projects/${CROWDIN_PROJECT_ID}/qa-checks?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Crowdin API error: ${response.status}`);
    }

    type QAResponse = {
      data: Array<{ data: QACheck }>;
    };

    const data = (await response.json()) as QAResponse;

    if (data.data.length === 0) break;

    for (const item of data.data) {
      allChecks.push(item.data);
    }

    console.log(`  Fetched ${allChecks.length} issues...`);

    if (data.data.length < limit) break;
    offset += limit;
  }

  return allChecks;
}

function generateReport(checks: QACheck[]): string {
  // Group by category
  const byCategory = new Map<string, QACheck[]>();

  for (const check of checks) {
    const key = check.category;
    const existing = byCategory.get(key) || [];

    existing.push(check);
    byCategory.set(key, existing);
  }

  // Group by language within each category
  let report = `# Crowdin QA Issues Report

Generated: ${new Date().toISOString()}

## Summary

- **Total QA Issues**: ${checks.length}
- **Categories**: ${byCategory.size}

| Category | Count | Description |
|----------|-------|-------------|
`;

  for (const [category, categoryChecks] of byCategory) {
    const desc = categoryChecks[0]?.categoryDescription || category;

    report += `| ${category} | ${categoryChecks.length} | ${desc} |\n`;
  }

  report += `
## Issues by Category

`;

  // Sort categories by count (most issues first), but put spellcheck last
  const sortedCategories = Array.from(byCategory.entries()).sort((a, b) => {
    if (a[0] === 'spellcheck') return 1;
    if (b[0] === 'spellcheck') return -1;

    return b[1].length - a[1].length;
  });

  for (const [category, categoryChecks] of sortedCategories) {
    const desc = categoryChecks[0]?.categoryDescription || category;

    // Group by language
    const byLang = new Map<string, QACheck[]>();

    for (const check of categoryChecks) {
      const existing = byLang.get(check.languageId) || [];

      existing.push(check);
      byLang.set(check.languageId, existing);
    }

    report += `### ${desc} (${categoryChecks.length} issues)

`;

    // Show top issues per language
    const sortedLangs = Array.from(byLang.entries()).sort(
      (a, b) => b[1].length - a[1].length,
    );

    for (const [lang, langChecks] of sortedLangs.slice(0, 10)) {
      report += `**${lang}** (${langChecks.length} issues):\n`;

      for (const check of langChecks.slice(0, 5)) {
        const truncatedText =
          check.text.length > 100 ? check.text.slice(0, 100) + '...' : check.text;

        report += `- String #${check.stringId}: ${truncatedText}\n`;
      }

      if (langChecks.length > 5) {
        report += `- ... and ${langChecks.length - 5} more\n`;
      }

      report += '\n';
    }

    if (sortedLangs.length > 10) {
      report += `*... and ${sortedLangs.length - 10} more languages with issues*\n\n`;
    }
  }

  report += `## How to Fix

### Variables Mismatch
These are the most critical - placeholders must match exactly:
- Check that all \`{placeholder}\` variables from source appear in translation
- Don't translate placeholder names (e.g., \`{days}\` should stay \`{days}\`, not \`{jours}\`)
- Include \`$\` for currency placeholders (e.g., \`\${price}\`)

### Punctuation/Special Characters
- Ensure ending punctuation matches (periods, question marks, etc.)
- Check parentheses and brackets are balanced

### Spellcheck
- Often false positives for technical terms - can usually be ignored
- Review for actual typos

---
**Fix in Crowdin**: https://twenty.crowdin.com/u/projects/1/all?filter=qa-issue

*To auto-fix encoding issues, run:*
\`\`\`
CROWDIN_PERSONAL_TOKEN=xxx npx ts-node packages/twenty-utils/fix-crowdin-translations.ts
\`\`\`
`;

  return report;
}

async function main() {
  const token = await getToken();

  const checks = await fetchAllQAChecks(token);

  console.log(`\nTotal QA issues: ${checks.length}`);

  // Group by category for summary
  const byCategory = new Map<string, number>();

  for (const check of checks) {
    byCategory.set(check.category, (byCategory.get(check.category) || 0) + 1);
  }

  console.log('\nBy category:');

  for (const [cat, count] of byCategory) {
    console.log(`  ${cat}: ${count}`);
  }

  // Generate report
  const report = generateReport(checks);
  const reportPath = path.join(process.cwd(), 'TRANSLATION_QA_REPORT.md');

  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\nReport written to: ${reportPath}`);

  // Return non-zero if there are critical issues (not spellcheck)
  const criticalIssues = checks.filter((c) => c.category !== 'spellcheck');

  if (criticalIssues.length > 0) {
    console.log(`\n⚠️  ${criticalIssues.length} critical issues found (excluding spellcheck)`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
