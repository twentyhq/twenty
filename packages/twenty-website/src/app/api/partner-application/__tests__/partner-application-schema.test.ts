import {
  buildLogicFunctionPayload,
  partnerApplicationRequestSchema,
} from '@/app/api/partner-application/partner-application-schema';

const minimalValid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
};

const fullValid = {
  ...minimalValid,
  website: 'https://analyticalengines.example',
  linkedin: 'https://www.linkedin.com/in/ada',
  city: 'London',
  country: 'UNITED_KINGDOM',
  languages: ['ENGLISH', 'FRENCH'],
  typeOfTeam: 'SOLO',
  partnerScope: ['APPS', 'DATA_MODEL'],
  skills: ['React', 'TypeScript'],
  deploymentExpertise: ['CLOUD'],
  workspaceUrl: 'https://app.twenty.com/workspace/ada',
  customerReferences: 'Acme Corp, Globex',
  hourlyRate: 150,
  projectBudgetMin: 5000,
  calendarLink: 'https://cal.com/ada',
};

describe('partnerApplicationRequestSchema', () => {
  it('accepts the minimal required payload', () => {
    const parsed = partnerApplicationRequestSchema.safeParse(minimalValid);
    expect(parsed.success).toBe(true);
  });

  it('accepts the full payload', () => {
    const parsed = partnerApplicationRequestSchema.safeParse(fullValid);
    expect(parsed.success).toBe(true);
  });

  it('rejects an unknown country enum value', () => {
    const parsed = partnerApplicationRequestSchema.safeParse({
      ...minimalValid,
      country: 'ATLANTIS',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an unknown scope enum value', () => {
    const parsed = partnerApplicationRequestSchema.safeParse({
      ...minimalValid,
      partnerScope: ['NOPE'],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects unknown top-level keys (strictObject)', () => {
    const parsed = partnerApplicationRequestSchema.safeParse({
      ...minimalValid,
      countryOther: 'Republic of Examples',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const parsed = partnerApplicationRequestSchema.safeParse({
      ...minimalValid,
      email: 'not-an-email',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('buildLogicFunctionPayload', () => {
  it('splits firstName/lastName from name and uses camelCase keys', () => {
    const payload = buildLogicFunctionPayload(fullValid as never);
    expect(payload.firstName).toBe('Ada');
    expect(payload.lastName).toBe('Lovelace');
    expect(payload.email).toBe('ada@example.com');
    expect(payload.companyName).toBe('Analytical Engines Ltd');
    expect(payload.hourlyRate).toBe(150);
    expect((payload as Record<string, unknown>).CurrencyCode).toBeUndefined();
  });

  it('omits keys for undefined optional fields', () => {
    const payload = buildLogicFunctionPayload(minimalValid as never);
    expect('linkedin' in payload).toBe(false);
    expect('country' in payload).toBe(false);
    expect('languages' in payload).toBe(false);
    expect('partnerScope' in payload).toBe(false);
    expect('domainName' in payload).toBe(false);
  });

  it('forwards website as domainName when provided', () => {
    const payload = buildLogicFunctionPayload(fullValid as never);
    expect(payload.domainName).toBe('https://analyticalengines.example');
  });
});
