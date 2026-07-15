import { Injectable } from '@nestjs/common';

import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import {
  FieldLeakageViolation,
  FirewallContext,
  FirewallViolationException,
} from 'src/modules/executive-search/firewall/firewall-registry.types';

@Injectable()
export class ReportLeakageScannerService {
  constructor(
    private readonly firewallRegistryService: FirewallRegistryService,
  ) {}

  /**
   * Scans a payload (top-level keys and one level of nesting) for any
   * firewall-prohibited fields across ALL contexts. Returns one violation
   * per match with selector, fieldPath, context, and rule.
   *
   * Scans against the UNION of all prohibited selectors across all contexts
   * — the spec requires catching *any* firewall-prohibited field.
   */
  scanPayload(
    payload: Record<string, unknown>,
  ): FieldLeakageViolation[] {
    const violations: FieldLeakageViolation[] = [];
    const allProhibited =
      this.firewallRegistryService.getAllProhibitedSelectors();

    // Scan top-level keys
    for (const [key, value] of Object.entries(payload)) {
      const normalizedKey =
        this.firewallRegistryService.normalizeSelector(key);

      if (allProhibited.has(normalizedKey)) {
        violations.push({
          selector: key,
          fieldPath: key,
          context: FirewallContext.CLIENT_REPORT,
          rule: this.firewallRegistryService.getAnyRule(key),
        });
      }

      // Scan one level of nesting
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        for (const nestedKey of Object.keys(
          value as Record<string, unknown>,
        )) {
          const normalizedNestedKey =
            this.firewallRegistryService.normalizeSelector(nestedKey);

          if (allProhibited.has(normalizedNestedKey)) {
            violations.push({
              selector: nestedKey,
              fieldPath: `${key}.${nestedKey}`,
              context: FirewallContext.CLIENT_REPORT,
              rule: this.firewallRegistryService.getAnyRule(nestedKey),
            });
          }
        }
      }
    }

    return violations;
  }

  /**
   * Throws FirewallViolationException if any firewall-prohibited field is
   * found in the payload.
   */
  assertPayloadSafe(payload: Record<string, unknown>): void {
    const violations = this.scanPayload(payload);

    if (violations.length > 0) {
      const messages = violations
        .map((v) => `"${v.fieldPath}" (${v.selector}): ${v.rule}`)
        .join('; ');

      throw new FirewallViolationException(
        `Payload contains prohibited fields: ${messages}`,
        violations,
      );
    }
  }
}