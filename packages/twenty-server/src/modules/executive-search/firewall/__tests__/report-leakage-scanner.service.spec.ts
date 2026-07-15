import { ReportLeakageScannerService } from 'src/modules/executive-search/firewall/guards/report-leakage-scanner.service';
import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import { FirewallViolationException } from 'src/modules/executive-search/firewall/firewall-registry.types';

describe('ReportLeakageScannerService', () => {
  let service: ReportLeakageScannerService;

  beforeEach(() => {
    service = new ReportLeakageScannerService(new FirewallRegistryService());
  });

  describe('scanPayload', () => {
    it('returns 1 violation for payload with subscriptionTier at top level', () => {
      const violations = service.scanPayload({
        name: 'Jane',
        subscriptionTier: 'premium',
      });

      expect(violations).toHaveLength(1);
      expect(violations[0].selector).toBe('subscriptionTier');
      expect(violations[0].fieldPath).toBe('subscriptionTier');
    });

    it('returns 1 violation for nested payload (one level deep)', () => {
      const violations = service.scanPayload({
        executive: {
          name: 'Jane',
          isPremium: true,
        },
      });

      expect(violations).toHaveLength(1);
      expect(violations[0].selector).toBe('isPremium');
      expect(violations[0].fieldPath).toBe('executive.isPremium');
    });

    it('returns empty array for safe payload (name, title)', () => {
      const violations = service.scanPayload({
        name: 'Jane',
        title: 'CTO',
      });

      expect(violations).toEqual([]);
    });

    it('returns multiple violations for a payload with several prohibited fields', () => {
      const violations = service.scanPayload({
        name: 'Jane',
        subscriptionTier: 'enterprise',
        birthdate: '1990-01-01',
        title: 'CTO',
      });

      expect(violations).toHaveLength(2);
      expect(violations.map((v) => v.selector)).toEqual(
        expect.arrayContaining(['subscriptionTier', 'birthdate']),
      );
    });

    it('handles nested object with null value', () => {
      const violations = service.scanPayload({
        executive: null,
      });

      expect(violations).toEqual([]);
    });

    it('handles nested object with array value (should not recurse into arrays)', () => {
      const violations = service.scanPayload({
        tags: ['subscription_tier', 'other'],
      });

      expect(violations).toEqual([]);
    });
  });

  describe('assertPayloadSafe', () => {
    it('throws FirewallViolationException when payload contains subscriptionTier', () => {
      expect(() => {
        service.assertPayloadSafe({ subscriptionTier: 'premium' });
      }).toThrow(FirewallViolationException);
    });

    it('does not throw for safe payload', () => {
      expect(() => {
        service.assertPayloadSafe({ name: 'Jane', title: 'CTO' });
      }).not.toThrow();
    });

    it('exception contains violation details', () => {
      try {
        service.assertPayloadSafe({ subscriptionTier: 'premium' });
      } catch (e) {
        expect(e.message).toContain('subscriptionTier');
        expect(e.violations).toHaveLength(1);
        expect(e.violations[0].selector).toBe('subscriptionTier');
      }
    });
  });
});
