import { Injectable } from '@nestjs/common';

import { FIREWALL_DENYLIST } from 'src/modules/executive-search/firewall/constants/firewall-denylist.constant';
import { FIREWALL_PROHIBITED_SELECTORS } from 'src/modules/executive-search/firewall/constants/firewall-prohibited-selectors.constant';
import {
  DenylistRule,
  FirewallContext,
} from 'src/modules/executive-search/firewall/firewall-registry.types';

@Injectable()
export class FirewallRegistryService {
  private readonly contextIndex: Map<FirewallContext, Set<string>>;
  private readonly denylistIndex: Map<string, DenylistRule[]>;

  constructor() {
    this.contextIndex = new Map<FirewallContext, Set<string>>();
    this.denylistIndex = new Map<string, DenylistRule[]>();

    // Build context index from prohibited selectors
    for (const entry of FIREWALL_PROHIBITED_SELECTORS) {
      const selectors = this.contextIndex.get(entry.context) ?? new Set<string>();
      selectors.add(entry.prohibitedSelector);
      this.contextIndex.set(entry.context, selectors);
    }

    // Build denylist index
    for (const entry of FIREWALL_DENYLIST) {
      const rules = this.denylistIndex.get(entry.fieldOrPattern) ?? [];
      rules.push(entry.rule);
      this.denylistIndex.set(entry.fieldOrPattern, rules);
    }
  }

  /**
   * Normalize a selector from camelCase to snake_case.
   * The CSV registries store selectors in snake_case (e.g. subscription_tier),
   * but the enforcement services receive field names in camelCase (e.g. subscriptionTier).
   */
  private normalizeSelector(selector: string): string {
    return selector.replace(/[A-Z]/g, (match) => '_' + match.toLowerCase());
  }

  isProhibited(selector: string, context: FirewallContext): boolean {
    return this.contextIndex.get(context)?.has(this.normalizeSelector(selector)) ?? false;
  }

  getProhibitedSelectors(context: FirewallContext): Set<string> {
    return this.contextIndex.get(context) ?? new Set<string>();
  }

  getAllProhibitedSelectors(): Set<string> {
    const all = new Set<string>();

    for (const selectors of this.contextIndex.values()) {
      for (const selector of selectors) {
        all.add(selector);
      }
    }

    return all;
  }

  isDenylisted(fieldOrPattern: string): boolean {
    return this.denylistIndex.has(this.normalizeSelector(fieldOrPattern));
  }

  getDenylistRules(fieldOrPattern: string): DenylistRule[] {
    return this.denylistIndex.get(this.normalizeSelector(fieldOrPattern)) ?? [];
  }
}
