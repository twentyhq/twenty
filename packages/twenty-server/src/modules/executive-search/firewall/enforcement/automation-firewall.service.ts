import { Injectable } from '@nestjs/common';

import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import {
  FirewallContext,
  FirewallViolationException,
} from 'src/modules/executive-search/firewall/firewall-registry.types';

@Injectable()
export class AutomationFirewallService {
  constructor(
    private readonly firewallRegistryService: FirewallRegistryService,
  ) {}

  /**
   * Returns the subset of referencedFields that are prohibited in
   * PIPELINE_AUTOMATION context. Empty array means all fields are safe.
   */
  validateAutomationRules(referencedFields: string[]): string[] {
    return referencedFields.filter((selector) =>
      this.firewallRegistryService.isProhibited(
        selector,
        FirewallContext.PIPELINE_AUTOMATION,
      ),
    );
  }

  /**
   * Throws FirewallViolationException if any referenced field is prohibited
   * in PIPELINE_AUTOMATION context.
   */
  assertAutomationRulesSafe(referencedFields: string[]): void {
    const violations: { selector: string; rule: string }[] = [];

    for (const selector of referencedFields) {
      if (
        this.firewallRegistryService.isProhibited(
          selector,
          FirewallContext.PIPELINE_AUTOMATION,
        )
      ) {
        violations.push({
          selector,
          rule: this.firewallRegistryService.getRule(
            selector,
            FirewallContext.PIPELINE_AUTOMATION,
          ),
        });
      }
    }

    if (violations.length > 0) {
      const violationMessages = violations
        .map((v) => `"${v.selector}": ${v.rule}`)
        .join('; ');

      throw new FirewallViolationException(
        `Automation rules reference prohibited selectors: ${violationMessages}`,
        violations.map((v) => ({
          selector: v.selector,
          fieldPath: v.selector,
          context: FirewallContext.PIPELINE_AUTOMATION,
          rule: v.rule,
        })),
      );
    }
  }
}