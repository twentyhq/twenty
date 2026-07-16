import * as fs from 'fs';
import * as path from 'path';

import { FIREWALL_DENYLIST } from 'src/modules/executive-search/firewall/constants/firewall-denylist.constant';
import { FIREWALL_PROHIBITED_SELECTORS } from 'src/modules/executive-search/firewall/constants/firewall-prohibited-selectors.constant';
import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import { FirewallContext } from 'src/modules/executive-search/firewall/firewall-registry.types';

describe('FirewallRegistryService', () => {
  let service: FirewallRegistryService;

  beforeEach(() => {
    service = new FirewallRegistryService();
  });

  describe('prohibited selectors integrity', () => {
    it('loads exactly 30 entries with status === "PROHIBITED"', () => {
      expect(FIREWALL_PROHIBITED_SELECTORS.length).toBe(30);
      for (const entry of FIREWALL_PROHIBITED_SELECTORS) {
        expect(entry.status).toBe('PROHIBITED');
      }
    });

    it('every context value is a valid FirewallContext enum', () => {
      const validContexts = new Set(Object.values(FirewallContext));

      for (const entry of FIREWALL_PROHIBITED_SELECTORS) {
        expect(validContexts.has(entry.context)).toBe(true);
      }
    });
  });

  describe('isProhibited', () => {
    it('subscription_tier is prohibited in SEARCH_FILTER context', () => {
      expect(
        service.isProhibited('subscription_tier', FirewallContext.SEARCH_FILTER),
      ).toBe(true);
    });

    it('subscriptionTier (camelCase) is prohibited in SEARCH_FILTER context via normalization', () => {
      expect(
        service.isProhibited('subscriptionTier', FirewallContext.SEARCH_FILTER),
      ).toBe(true);
    });

    it('name is NOT prohibited in SEARCH_FILTER context', () => {
      expect(
        service.isProhibited('name', FirewallContext.SEARCH_FILTER),
      ).toBe(false);
    });
  });

  describe('getProhibitedSelectors', () => {
    it('returns a non-empty set for SEARCH_FILTER', () => {
      const selectors = service.getProhibitedSelectors(
        FirewallContext.SEARCH_FILTER,
      );

      expect(selectors.size).toBeGreaterThan(0);
    });

    it('returns empty set for unknown context', () => {
      const selectors = service.getProhibitedSelectors(
        'unknown_context' as FirewallContext,
      );

      expect(selectors.size).toBe(0);
    });
  });

  describe('getAllProhibitedSelectors', () => {
    it('returns a union across all contexts', () => {
      const all = service.getAllProhibitedSelectors();

      // subscription_tier appears in 5 contexts, plan_level in 2, etc.
      // The union should contain the unique selectors
      expect(all.has('subscription_tier')).toBe(true);
      expect(all.has('plan_level')).toBe(true);
      expect(all.has('is_premium')).toBe(true);
      expect(all.has('birthdate')).toBe(true);
      expect(all.has('unreviewed_culture_fit_score')).toBe(true);
    });
  });

  describe('isDenylisted', () => {
    it('executives.subscription_tier is denylisted', () => {
      expect(service.isDenylisted('executives.subscription_tier')).toBe(true);
    });

    it('non-existent field is not denylisted', () => {
      expect(service.isDenylisted('executives.nonexistent')).toBe(false);
    });
  });

  describe('getDenylistRules', () => {
    it('returns NO_SYNC for executives.subscription_tier', () => {
      const rules = service.getDenylistRules('executives.subscription_tier');

      expect(rules).toEqual(['NO_SYNC']);
    });

    it('returns an empty array for non-denylisted field', () => {
      const rules = service.getDenylistRules('executives.nonexistent');

      expect(rules).toEqual([]);
    });
  });

  describe('CSV drift test — commercial-selection-firewall', () => {
    const csvPath = path.resolve(
      __dirname,
      '../../../../../../../docs/executive-search/commercial-selection-firewall.csv',
    );

    it('every CSV row appears in FIREWALL_PROHIBITED_SELECTORS and vice versa', () => {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.trim().split('\n');

      // Skip header line
      const csvRows = lines.slice(1).map((line) => {
        const [prohibitedSelector, context, status, ...ruleParts] =
          line.split(',');
        return {
          prohibitedSelector: prohibitedSelector.trim(),
          context: context.trim() as FirewallContext,
          status: status.trim(),
          rule: ruleParts.join(',').replace(/^"(.*)"$/, '$1').trim(),
        };
      });

      // Every CSV row should be in the constant
      for (const csvRow of csvRows) {
        const found = FIREWALL_PROHIBITED_SELECTORS.some(
          (entry) =>
            entry.prohibitedSelector === csvRow.prohibitedSelector &&
            entry.context === csvRow.context &&
            entry.rule === csvRow.rule,
        );
        expect(found).toBe(true);
      }

      // Every constant entry should be in the CSV
      for (const entry of FIREWALL_PROHIBITED_SELECTORS) {
        const found = csvRows.some(
          (row) =>
            row.prohibitedSelector === entry.prohibitedSelector &&
            row.context === entry.context &&
            row.rule === entry.rule,
        );
        expect(found).toBe(true);
      }

      // Counts must match
      expect(csvRows.length).toBe(FIREWALL_PROHIBITED_SELECTORS.length);
    });
  });

  describe('CSV drift test — candidate-facing-nonreplication-denylist', () => {
    const csvPath = path.resolve(
      __dirname,
      '../../../../../../../docs/executive-search/candidate-facing-nonreplication-denylist.csv',
    );

    it('every CSV row appears in FIREWALL_DENYLIST and vice versa', () => {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.trim().split('\n');

      // Skip header line
      const csvRows = lines.slice(1).map((line) => {
        // CSV may have quoted fields; handle simple parsing
        const parts = parseCsvLine(line);
        return {
          fieldOrPattern: parts[0].trim(),
          dataClassification: parts[1].trim(),
          rule: parts[2].trim(),
          reason: parts[3].replace(/^"(.*)"$/, '$1').trim(),
        };
      });

      // Every CSV row should be in the constant
      for (const csvRow of csvRows) {
        const found = FIREWALL_DENYLIST.some(
          (entry) =>
            entry.fieldOrPattern === csvRow.fieldOrPattern &&
            entry.rule === csvRow.rule,
        );
        expect(found).toBe(true);
      }

      // Every constant entry should be in the CSV
      for (const entry of FIREWALL_DENYLIST) {
        const found = csvRows.some(
          (row) =>
            row.fieldOrPattern === entry.fieldOrPattern &&
            row.rule === entry.rule,
        );
        expect(found).toBe(true);
      }

      // Counts must match
      expect(csvRows.length).toBe(FIREWALL_DENYLIST.length);
    });
  });
});

/**
 * Simple CSV line parser that handles double-quoted fields containing commas.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);

  return result;
}
