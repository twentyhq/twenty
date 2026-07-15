import { FIREWALL_DENYLIST } from 'src/modules/executive-search/firewall/constants/firewall-denylist.constant';
import { FIREWALL_PROHIBITED_FIELD_PERMISSIONS } from 'src/modules/executive-search/firewall/constants/firewall-prohibited-field-permissions.constant';
import { FIREWALL_PROHIBITED_SELECTORS } from 'src/modules/executive-search/firewall/constants/firewall-prohibited-selectors.constant';
import { AiContextFirewallService } from 'src/modules/executive-search/firewall/enforcement/ai-context-firewall.service';
import { AutomationFirewallService } from 'src/modules/executive-search/firewall/enforcement/automation-firewall.service';
import { ReportLeakageScannerService } from 'src/modules/executive-search/firewall/enforcement/report-leakage-scanner.service';
import { SearchContextFirewallService } from 'src/modules/executive-search/firewall/enforcement/search-context-firewall.service';
import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import {
  FieldLeakageViolation,
  FirewallContext,
  FirewallViolationException,
} from 'src/modules/executive-search/firewall/firewall-registry.types';

describe('Firewall Contract Suite', () => {
  let registryService: FirewallRegistryService;
  let searchService: SearchContextFirewallService;
  let aiService: AiContextFirewallService;
  let reportService: ReportLeakageScannerService;
  let automationService: AutomationFirewallService;

  beforeEach(() => {
    registryService = new FirewallRegistryService();
    searchService = new SearchContextFirewallService(registryService);
    aiService = new AiContextFirewallService(registryService);
    reportService = new ReportLeakageScannerService(registryService);
    automationService = new AutomationFirewallService(registryService);
  });

  // ---------------------------------------------------------------------------
  // 1. Registry integrity
  // ---------------------------------------------------------------------------
  describe('1. Registry integrity', () => {
    it('every entry has status === "PROHIBITED"', () => {
      for (const entry of FIREWALL_PROHIBITED_SELECTORS) {
        expect(entry.status).toBe('PROHIBITED');
      }
    });

    it('no entry is missing a rule string', () => {
      for (const entry of FIREWALL_PROHIBITED_SELECTORS) {
        expect(entry.rule).toBeDefined();
        expect(entry.rule.length).toBeGreaterThan(0);
      }
    });

    it('every context value is a valid FirewallContext enum member', () => {
      const validContexts = new Set(Object.values(FirewallContext));

      for (const entry of FIREWALL_PROHIBITED_SELECTORS) {
        expect(validContexts.has(entry.context)).toBe(true);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Cross-layer blocking — subscription_tier triggers violations in every
  //    enforcement service
  // ---------------------------------------------------------------------------
  describe('2. Cross-layer blocking', () => {
    it('subscriptionTier is blocked by SearchContextFirewallService', () => {
      const result = searchService.validateSearchFields([
        'name',
        'title',
        'subscriptionTier',
      ]);

      expect(result).toEqual(['subscriptionTier']);
    });

    it('subscriptionTier is blocked by AiContextFirewallService (validateAiContextAllowlist)', () => {
      const result = aiService.validateAiContextAllowlist([
        'name',
        'title',
        'subscriptionTier',
      ]);

      expect(result).toEqual(['subscriptionTier']);
    });

    it('subscriptionTier is flagged by ReportLeakageScannerService (scanPayload)', () => {
      const violations = reportService.scanPayload({
        name: 'Jane',
        subscriptionTier: 'premium',
      });

      expect(violations.length).toBeGreaterThanOrEqual(1);
      expect(violations.map((v) => v.selector)).toContain('subscriptionTier');
    });

    it('subscriptionTier is blocked by AutomationFirewallService', () => {
      const result = automationService.validateAutomationRules([
        'stage',
        'subscriptionTier',
      ]);

      expect(result).toEqual(['subscriptionTier']);
    });

    it('a single prohibited selector triggers violations in every enforcement service simultaneously', () => {
      // Search
      const searchResult = searchService.validateSearchFields([
        'name',
        'subscriptionTier',
      ]);
      expect(searchResult).toEqual(['subscriptionTier']);

      // AI context allowlist
      const aiResult = aiService.validateAiContextAllowlist([
        'name',
        'subscriptionTier',
      ]);
      expect(aiResult).toEqual(['subscriptionTier']);

      // Report scan
      const reportResult = reportService.scanPayload({
        name: 'Jane',
        subscriptionTier: 'premium',
      });
      expect(reportResult.length).toBeGreaterThanOrEqual(1);
      expect(reportResult[0].selector).toBe('subscriptionTier');

      // Automation
      const autoResult = automationService.validateAutomationRules([
        'stage',
        'subscriptionTier',
      ]);
      expect(autoResult).toEqual(['subscriptionTier']);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Golden-path equivalence (leakage test contract)
  // ---------------------------------------------------------------------------
  describe('3. Golden-path equivalence', () => {
    const executiveA = {
      name: 'Jane Doe',
      title: 'CTO',
      subscriptionTier: 'premium',
      planLevel: 'enterprise',
      isPremium: true,
    };
    const executiveB = {
      name: 'Jane Doe',
      title: 'CTO',
      subscriptionTier: 'free',
      planLevel: 'basic',
      isPremium: false,
    };

    it('Report scanner equivalence — violations are structurally identical regardless of values', () => {
      const violationsA = reportService.scanPayload(executiveA);
      const violationsB = reportService.scanPayload(executiveB);

      // Same length
      expect(violationsA.length).toBe(violationsB.length);

      // Same selectors flagged (order-independent)
      const selectorsA = violationsA.map((v) => v.selector).sort();
      const selectorsB = violationsB.map((v) => v.selector).sort();

      expect(selectorsB).toEqual(selectorsA);

      // Both should flag subscriptionTier, planLevel, isPremium
      expect(selectorsA).toEqual(
        expect.arrayContaining(['subscriptionTier', 'planLevel', 'isPremium']),
      );
    });

    it('AI context filter equivalence — both payloads produce identical safe field set', () => {
      const keysA = Object.keys(executiveA);
      const keysB = Object.keys(executiveB);

      // Sanity: same keys
      expect(keysA).toEqual(keysB);

      const filteredA = aiService.filterProhibited(keysA);
      const filteredB = aiService.filterProhibited(keysB);

      // Identical results — the tier difference is invisible after filtering
      expect(filteredB).toEqual(filteredA);

      // subscriptionTier and planLevel are removed (both in AI_CONTEXT);
      // isPremium remains (only in SEARCH_FILTER and CLIENT_REPORT, not AI_CONTEXT/SELECTION_CONTEXT)
      expect(filteredA).toContain('name');
      expect(filteredA).toContain('title');
      expect(filteredA).toContain('isPremium');
      expect(filteredA).not.toContain('subscriptionTier');
      expect(filteredA).not.toContain('planLevel');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Denylist boundary completeness
  // ---------------------------------------------------------------------------
  describe('4. Denylist boundary completeness', () => {
    /**
     * Known selector → fieldOrPattern mappings where a prohibited selector has a
     * corresponding denylist entry. Each entry here maps the prohibited selector
     * (from FIREWALL_PROHIBITED_SELECTORS) to the full fieldOrPattern used in
     * FIREWALL_DENYLIST.
     */
    const knownDenylistMappings: { selector: string; fieldOrPattern: string }[] = [
      { selector: 'subscription_tier', fieldOrPattern: 'executives.subscription_tier' },
      { selector: 'plan_level', fieldOrPattern: 'executives.plan_level' },
      { selector: 'is_premium', fieldOrPattern: 'executives.is_premium' },
      { selector: 'stripe_customer_id', fieldOrPattern: 'executive_settings.stripe_customer_id' },
      { selector: 'photo_analysis_scores', fieldOrPattern: 'profile_analyses.photo_analysis_scores' },
      { selector: 'birthdate', fieldOrPattern: 'executives.birthdate' },
      { selector: 'gender', fieldOrPattern: 'executives.gender' },
    ];

    /**
     * Selectors that do NOT have a direct denylist entry mapping. These are
     * either covered by broader wildcard patterns or guarded by other mechanisms:
     *
     * - purchase_payment_history: payment history lives in executive_settings;
     *   covered similarly to stripe_customer_id but not explicitly listed.
     * - marketing_opt_in, marketing_engagement: product engagement metrics
     *   covered by executive_settings.product_engagement_metrics pattern.
     * - learning_activity, course_completion, quiz_activity: covered by
     *   learning_path_*.course_completion_quiz_activity wildcard.
     * - content_consumption, profile_views: candidate-services reference data
     *   covered by linkedin_*.profile_engagement_content_activity or
     *   pitch_practice_*.rehearsal_data patterns.
     * - candidate_service_usage_frequency: product engagement telemetry
     *   covered by executive_settings.product_engagement_metrics.
     * - executive_psychographic: covered by executive_psychographic.* wildcard
     *   (NOT exact match, so isDenylisted returns false for the exact string).
     * - voluntary_demographics: covered by candidate_demographics_voluntary.*.
     * - accommodation_medical_info: covered by accommodation_requests.medical_documents.
     * - unreviewed_culture_fit_score: covered by ai_application_analysis.culture_fit_score
     *   quarantined entry.
     */
    const selectorsWithoutDirectDenylist = new Set<string>([
      'purchase_payment_history',
      'marketing_opt_in',
      'learning_activity',
      'course_completion',
      'quiz_activity',
      'content_consumption',
      'profile_views',
      'marketing_engagement',
      'candidate_service_usage_frequency',
      'executive_psychographic',
      'voluntary_demographics',
      'accommodation_medical_info',
      'unreviewed_culture_fit_score',
    ]);

    it('known direct denylist mappings are confirmed by FirewallRegistryService.isDenylisted()', () => {
      for (const mapping of knownDenylistMappings) {
        expect(registryService.isDenylisted(mapping.fieldOrPattern)).toBe(true);
      }
    });

    it('every distinct prohibited selector either has a denylist match or is accounted for', () => {
      const distinctSelectors = new Set(
        FIREWALL_PROHIBITED_SELECTORS.map((e) => e.prohibitedSelector),
      );

      for (const selector of distinctSelectors) {
        const directMapping = knownDenylistMappings.find(
          (m) => m.selector === selector,
        );

        if (directMapping) {
          // Has a direct denylist mapping — verify it
          expect(registryService.isDenylisted(directMapping.fieldOrPattern)).toBe(
            true,
          );
        } else {
          // No direct mapping — must be in the accounted-for set
          expect(selectorsWithoutDirectDenylist.has(selector)).toBe(true);
        }
      }
    });

    it('every denylist entry referenced by a known mapping has the correct rule', () => {
      const denylistRuleMap: Record<string, string[]> = {};
      for (const entry of FIREWALL_DENYLIST) {
        denylistRuleMap[entry.fieldOrPattern] ??= [];
        denylistRuleMap[entry.fieldOrPattern].push(entry.rule);
      }

      // subscription data → NO_SYNC
      expect(denylistRuleMap['executives.subscription_tier']).toContain('NO_SYNC');
      expect(denylistRuleMap['executives.plan_level']).toContain('NO_SYNC');
      expect(denylistRuleMap['executives.is_premium']).toContain('NO_SYNC');

      // Restricted personal data → NO_SYNC_SELECTION
      expect(denylistRuleMap['executives.birthdate']).toContain('NO_SYNC_SELECTION');
      expect(denylistRuleMap['executives.gender']).toContain('NO_SYNC_SELECTION');

      // Payment data → NO_SYNC
      expect(denylistRuleMap['executive_settings.stripe_customer_id']).toContain(
        'NO_SYNC',
      );

      // Photo analysis → NO_SYNC
      expect(denylistRuleMap['profile_analyses.photo_analysis_scores']).toContain(
        'NO_SYNC',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Field permission seed completeness
  // ---------------------------------------------------------------------------
  describe('5. Field permission seed completeness', () => {
    it('every distinct prohibited selector appears in FIREWALL_PROHIBITED_FIELD_PERMISSIONS', () => {
      const distinctSelectors = new Set(
        FIREWALL_PROHIBITED_SELECTORS.map((e) => e.prohibitedSelector),
      );
      const permissionSelectors = new Set(
        FIREWALL_PROHIBITED_FIELD_PERMISSIONS.map((p) => p.selector),
      );

      for (const selector of distinctSelectors) {
        expect(permissionSelectors.has(selector)).toBe(true);
      }
    });

    it('every seed entry has canReadFieldValue set to false', () => {
      for (const entry of FIREWALL_PROHIBITED_FIELD_PERMISSIONS) {
        expect(entry.canReadFieldValue).toBe(false);
      }
    });

    it('every seed entry has a non-empty objectUniversalIdentifier', () => {
      for (const entry of FIREWALL_PROHIBITED_FIELD_PERMISSIONS) {
        expect(entry.objectUniversalIdentifier).toBeDefined();
        expect(entry.objectUniversalIdentifier.length).toBeGreaterThan(0);
      }
    });

    it('every seed entry has a non-empty fieldUniversalIdentifier', () => {
      for (const entry of FIREWALL_PROHIBITED_FIELD_PERMISSIONS) {
        expect(entry.fieldUniversalIdentifier).toBeDefined();
        expect(entry.fieldUniversalIdentifier.length).toBeGreaterThan(0);
      }
    });

    it('no extraneous selectors in field permissions that are not in the prohibited registry', () => {
      const distinctSelectors = new Set(
        FIREWALL_PROHIBITED_SELECTORS.map((e) => e.prohibitedSelector),
      );

      for (const entry of FIREWALL_PROHIBITED_FIELD_PERMISSIONS) {
        expect(distinctSelectors.has(entry.selector)).toBe(true);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Context coverage
  // ---------------------------------------------------------------------------
  describe('6. Context coverage', () => {
    it('all 6 FirewallContext enum values appear in the registry', () => {
      const contextsInRegistry = new Set(
        FIREWALL_PROHIBITED_SELECTORS.map((e) => e.context),
      );

      for (const ctx of Object.values(FirewallContext)) {
        expect(contextsInRegistry.has(ctx)).toBe(true);
      }
    });

    it('each context has at least one prohibited selector', () => {
      for (const ctx of Object.values(FirewallContext)) {
        const count = FIREWALL_PROHIBITED_SELECTORS.filter(
          (e) => e.context === ctx,
        ).length;
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });

    it('subscription_tier is prohibited in 5 contexts (not SELECTION_CONTEXT)', () => {
      const contexts = FIREWALL_PROHIBITED_SELECTORS.filter(
        (e) => e.prohibitedSelector === 'subscription_tier',
      ).map((e) => e.context);

      expect(contexts).toHaveLength(5);
      expect(contexts).not.toContain(FirewallContext.SELECTION_CONTEXT);
      expect(contexts).toContain(FirewallContext.SEARCH_FILTER);
      expect(contexts).toContain(FirewallContext.AI_CONTEXT);
      expect(contexts).toContain(FirewallContext.CLIENT_REPORT);
      expect(contexts).toContain(FirewallContext.SLATE_PRESENTATION);
      expect(contexts).toContain(FirewallContext.PIPELINE_AUTOMATION);
    });
  });
});
