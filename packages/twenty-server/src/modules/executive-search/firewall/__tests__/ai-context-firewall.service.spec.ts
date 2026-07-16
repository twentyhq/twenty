import { AiContextFirewallService } from 'src/modules/executive-search/firewall/enforcement/ai-context-firewall.service';
import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import { FirewallViolationException } from 'src/modules/executive-search/firewall/firewall-registry.types';

describe('AiContextFirewallService', () => {
  let service: AiContextFirewallService;

  beforeEach(() => {
    service = new AiContextFirewallService(new FirewallRegistryService());
  });

  describe('validateAiContextAllowlist', () => {
    it('returns [birthdate, gender] from allowlist [name, birthdate, gender] (both prohibited in AI_CONTEXT)', () => {
      const result = service.validateAiContextAllowlist([
        'name',
        'birthdate',
        'gender',
      ]);

      expect(result).toEqual(['birthdate', 'gender']);
    });

    it('returns [] for safe allowlist [name, experience]', () => {
      const result = service.validateAiContextAllowlist([
        'name',
        'experience',
      ]);

      expect(result).toEqual([]);
    });

    it('handles camelCase selectors like subscriptionTier', () => {
      const result = service.validateAiContextAllowlist([
        'name',
        'subscriptionTier',
      ]);

      expect(result).toEqual(['subscriptionTier']);
    });
  });

  describe('assertAiContextAllowlistSafe', () => {
    it('throws FirewallViolationException when allowlist contains birthdate', () => {
      expect(() => {
        service.assertAiContextAllowlistSafe(['name', 'birthdate']);
      }).toThrow(FirewallViolationException);
    });

    it('does not throw for safe allowlist', () => {
      expect(() => {
        service.assertAiContextAllowlistSafe(['name', 'experience']);
      }).not.toThrow();
    });
  });

  describe('filterProhibited', () => {
    it('removes subscriptionTier, birthdate from [name, subscriptionTier, birthdate, experience] returning [name, experience]', () => {
      const result = service.filterProhibited([
        'name',
        'subscriptionTier',
        'birthdate',
        'experience',
      ]);

      expect(result).toEqual(['name', 'experience']);
    });

    it('returns the same list when no fields are prohibited', () => {
      const result = service.filterProhibited(['name', 'experience']);

      expect(result).toEqual(['name', 'experience']);
    });

    it('removes all prohibited fields leaving an empty array', () => {
      const result = service.filterProhibited([
        'subscriptionTier',
        'birthdate',
        'gender',
      ]);

      expect(result).toEqual([]);
    });
  });
});
