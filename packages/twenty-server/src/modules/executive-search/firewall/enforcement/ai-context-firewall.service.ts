import { Injectable } from '@nestjs/common';

import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import {
  FirewallContext,
  FirewallViolationException,
} from 'src/modules/executive-search/firewall/firewall-registry.types';

@Injectable()
export class AiContextFirewallService {
  constructor(
    private readonly firewallRegistryService: FirewallRegistryService,
  ) {}

  /**
   * Validates a positive allowlist of fields against prohibited selectors in
   * AI_CONTEXT and SELECTION_CONTEXT. Returns the subset of allowlistedFields
   * that intersect with prohibited selectors. Empty array means the allowlist is safe.
   */
  validateAiContextAllowlist(allowlistedFields: string[]): string[] {
    const prohibitedAi = this.firewallRegistryService.getProhibitedSelectors(
      FirewallContext.AI_CONTEXT,
    );
    const prohibitedSelection =
      this.firewallRegistryService.getProhibitedSelectors(
        FirewallContext.SELECTION_CONTEXT,
      );
    const allProhibited = new Set([
      ...prohibitedAi,
      ...prohibitedSelection,
    ]);

    return allowlistedFields.filter((field) => {
      const normalized = this.firewallRegistryService.normalizeSelector(field);

      return allProhibited.has(normalized);
    });
  }

  /**
   * Throws FirewallViolationException if any allowlisted field intersects with
   * prohibited selectors in AI_CONTEXT or SELECTION_CONTEXT.
   */
  assertAiContextAllowlistSafe(allowlistedFields: string[]): void {
    const violations = this.validateAiContextAllowlist(allowlistedFields);

    if (violations.length > 0) {
      throw new FirewallViolationException(
        `AI context allowlist contains prohibited fields: ${violations.join(', ')}`,
        violations.map((selector) => ({
          selector,
          fieldPath: `allowlist.${selector}`,
          context: FirewallContext.AI_CONTEXT,
          rule: `Field "${selector}" is prohibited in AI context and must not be allowlisted`,
        })),
      );
    }
  }

  /**
   * Defense-in-depth backstop. Do NOT use as the primary AI context construction
   * mechanism — the spec requires a positive allowlist. When the future AI context
   * builder calls this, it should still build context from the approved allowlist,
   * not by filtering a full field set.
   *
   * Returns the input fields with any prohibited AI_CONTEXT/SELECTION_CONTEXT
   * selectors removed.
   */
  filterProhibited(fields: string[]): string[] {
    const prohibitedAi = this.firewallRegistryService.getProhibitedSelectors(
      FirewallContext.AI_CONTEXT,
    );
    const prohibitedSelection =
      this.firewallRegistryService.getProhibitedSelectors(
        FirewallContext.SELECTION_CONTEXT,
      );
    const allProhibited = new Set([
      ...prohibitedAi,
      ...prohibitedSelection,
    ]);

    return fields.filter((field) => {
      const normalized = this.firewallRegistryService.normalizeSelector(field);

      return !allProhibited.has(normalized);
    });
  }
}