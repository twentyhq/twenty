import { AutomationFirewallService } from 'src/modules/executive-search/firewall/enforcement/automation-firewall.service';
import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import { FirewallViolationException } from 'src/modules/executive-search/firewall/firewall-registry.types';

describe('AutomationFirewallService', () => {
  let service: AutomationFirewallService;

  beforeEach(() => {
    service = new AutomationFirewallService(new FirewallRegistryService());
  });

  describe('validateAutomationRules', () => {
    it('returns [subscriptionTier] when stage and subscriptionTier are referenced', () => {
      const result = service.validateAutomationRules([
        'stage',
        'subscriptionTier',
      ]);

      expect(result).toEqual(['subscriptionTier']);
    });

    it('returns empty array for safe fields (stage, name)', () => {
      const result = service.validateAutomationRules(['stage', 'name']);

      expect(result).toEqual([]);
    });

    it('handles camelCase input via normalization', () => {
      const result = service.validateAutomationRules([
        'subscriptionTier',
        'stage',
      ]);

      expect(result).toEqual(['subscriptionTier']);
    });
  });

  describe('assertAutomationRulesSafe', () => {
    it('throws FirewallViolationException when subscriptionTier is referenced', () => {
      expect(() => {
        service.assertAutomationRulesSafe(['subscriptionTier']);
      }).toThrow(FirewallViolationException);
    });

    it('does not throw for safe fields', () => {
      expect(() => {
        service.assertAutomationRulesSafe(['stage', 'name']);
      }).not.toThrow();
    });

    it('exception contains violation details', () => {
      expect.assertions(4);

      try {
        service.assertAutomationRulesSafe(['subscriptionTier']);
      } catch (e) {
        expect(e.message).toContain('subscriptionTier');
        expect(e.violations).toHaveLength(1);
        expect(e.violations[0].selector).toBe('subscriptionTier');
        expect(e.violations[0].context).toBe('pipeline_automation');
      }
    });
  });
});
