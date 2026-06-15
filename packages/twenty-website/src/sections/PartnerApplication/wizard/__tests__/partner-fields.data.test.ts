import {
  PARTNER_SCOPE_VALUES,
  PARTNER_SCOPE_OPTIONS,
  PARTNER_SKILL_SUGGESTIONS,
  PARTNER_SKILL_POOL,
  PARTNER_APPLICATION_STEP_REQUIRED_FIELDS,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';

describe('partner-fields.data', () => {
  it('exposes the five validated category values', () => {
    expect([...PARTNER_SCOPE_VALUES]).toEqual([
      'ADVISORY',
      'SOLUTIONING',
      'DEVELOPMENT',
      'HOSTING',
      'SUPPORT',
    ]);
  });

  it('has one option (value/label/description/examples) per category value', () => {
    expect(PARTNER_SCOPE_OPTIONS.map((o) => o.value)).toEqual([
      ...PARTNER_SCOPE_VALUES,
    ]);
    for (const option of PARTNER_SCOPE_OPTIONS) {
      expect(option.label).toBeDefined();
      expect(option.description).toBeDefined();
      expect(option.examples).toBeDefined();
    }
  });

  it('ships a non-empty starter skills suggestion pool', () => {
    expect(PARTNER_SKILL_SUGGESTIONS.length).toBeGreaterThan(0);
    expect(PARTNER_SKILL_SUGGESTIONS).toContain('Data migration');
  });

  it('ships a non-empty searchable skill pool containing technical entries', () => {
    expect(PARTNER_SKILL_POOL.length).toBeGreaterThan(0);
    expect(PARTNER_SKILL_POOL).toContain('React');
  });

  it('requires country, typeOfTeam, and city on profile, partnerScope on expertise', () => {
    expect([...PARTNER_APPLICATION_STEP_REQUIRED_FIELDS.identity]).toEqual([
      'name',
      'email',
      'company',
      'website',
    ]);
    expect([...PARTNER_APPLICATION_STEP_REQUIRED_FIELDS.profile]).toEqual([
      'country',
      'typeOfTeam',
      'city',
    ]);
    expect([...PARTNER_APPLICATION_STEP_REQUIRED_FIELDS.expertise]).toEqual([
      'partnerScope',
    ]);
    expect([...PARTNER_APPLICATION_STEP_REQUIRED_FIELDS.commercials]).toEqual([
      'hourlyRate',
      'projectBudgetMin',
    ]);
  });
});
