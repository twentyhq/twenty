import { Injectable } from '@nestjs/common';

import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import {
  FirewallContext,
  FirewallViolationException,
} from 'src/modules/executive-search/firewall/firewall-registry.types';

@Injectable()
export class SearchContextFirewallService {
  constructor(
    private readonly firewallRegistryService: FirewallRegistryService,
  ) {}

  /**
   * Returns the subset of fieldSelectors that are prohibited in SEARCH_FILTER context.
   * Empty array means all fields are safe.
   * Accepts camelCase selectors (e.g. subscriptionTier) which are normalized internally.
   */
  validateSearchFields(fieldSelectors: string[]): string[] {
    return fieldSelectors.filter((selector) =>
      this.firewallRegistryService.isProhibited(
        selector,
        FirewallContext.SEARCH_FILTER,
      ),
    );
  }

  /**
   * Throws FirewallViolationException if any selector is prohibited in SEARCH_FILTER context.
   * Error message lists the violating selectors and their rules.
   */
  assertSearchFieldsSafe(fieldSelectors: string[]): void {
    const violations: {
      selector: string;
      rule: string;
    }[] = [];

    for (const selector of fieldSelectors) {
      if (
        this.firewallRegistryService.isProhibited(
          selector,
          FirewallContext.SEARCH_FILTER,
        )
      ) {
        violations.push({
          selector,
          rule: this.firewallRegistryService.getRule(
            selector,
            FirewallContext.SEARCH_FILTER,
          ),
        });
      }
    }

    if (violations.length > 0) {
      const violationMessages = violations
        .map((v) => `"${v.selector}": ${v.rule}`)
        .join('; ');

      throw new FirewallViolationException(
        `Search fields contain prohibited selectors: ${violationMessages}`,
        violations.map((v) => ({
          selector: v.selector,
          fieldPath: v.selector,
          context: FirewallContext.SEARCH_FILTER,
          rule: v.rule,
        })),
      );
    }
  }
}