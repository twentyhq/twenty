import { SearchContextFirewallService } from 'src/modules/executive-search/firewall/guards/search-context-firewall.service';
import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import { FirewallViolationException } from 'src/modules/executive-search/firewall/firewall-registry.types';

describe('SearchContextFirewallService', () => {
  let service: SearchContextFirewallService;

  beforeEach(() => {
    service = new SearchContextFirewallService(new FirewallRegistryService());
  });

  describe('validateSearchFields', () => {
    it('returns [subscriptionTier] when name, email, and subscriptionTier are checked (camelCase input via normalization)', () => {
      const result = service.validateSearchFields([
        'name',
        'email',
        'subscriptionTier',
      ]);

      expect(result).toEqual(['subscriptionTier']);
    });

    it('returns empty array for safe fields (name, email)', () => {
      const result = service.validateSearchFields(['name', 'email']);

      expect(result).toEqual([]);
    });

    it('returns multiple prohibited selectors when present', () => {
      const result = service.validateSearchFields([
        'name',
        'subscriptionTier',
        'email',
        'isPremium',
      ]);

      expect(result).toEqual(['subscriptionTier', 'isPremium']);
    });
  });

  describe('assertSearchFieldsSafe', () => {
    it('throws FirewallViolationException when subscriptionTier is in the field list', () => {
      expect(() => {
        service.assertSearchFieldsSafe(['subscriptionTier']);
      }).toThrow(FirewallViolationException);
    });

    it('does not throw for safe fields', () => {
      expect(() => {
        service.assertSearchFieldsSafe(['name', 'email']);
      }).not.toThrow();
    });

    it('throw error message contains the violating selector name', () => {
      try {
        service.assertSearchFieldsSafe(['subscriptionTier']);
      } catch (e) {
        expect(e.message).toContain('subscriptionTier');
        expect(e.violations).toHaveLength(1);
        expect(e.violations[0].selector).toBe('subscriptionTier');
        expect(e.violations[0].context).toBe('search_filter');
      }
    });
  });
});
