import {
  buildWebhookPayload,
  partnerApplicationRequestSchema,
  type PartnerApplicationRequest,
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
      programId: 'technology',
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

describe('buildWebhookPayload', () => {
  it('splits FirstName/LastName from name and sets USD currency', () => {
    const payload = buildWebhookPayload({
      ...fullValid,
    } as PartnerApplicationRequest);
    expect(payload.FirstName).toBe('Ada');
    expect(payload.LastName).toBe('Lovelace');
    expect(payload.Email).toBe('ada@example.com');
    expect(payload.Company).toBe('Analytical Engines Ltd');
    expect(payload.HourlyRate).toBe(150);
    expect(payload.CurrencyCode).toBe('USD');
  });

  it('omits keys for undefined optional fields', () => {
    const payload = buildWebhookPayload(minimalValid as PartnerApplicationRequest);
    expect('Linkedin' in payload).toBe(false);
    expect('Country' in payload).toBe(false);
    expect('CountryOther' in payload).toBe(false);
    expect('Languages' in payload).toBe(false);
    expect('PartnerScope' in payload).toBe(false);
    expect(payload.CurrencyCode).toBe('USD');
  });

  it('forwards CountryOther free text when provided', () => {
    const payload = buildWebhookPayload({
      ...minimalValid,
      countryOther: 'Republic of Examples',
    } as PartnerApplicationRequest);
    expect(payload.CountryOther).toBe('Republic of Examples');
    expect('Country' in payload).toBe(false);
  });

  it('forwards LanguagesOther free text when provided', () => {
    const payload = buildWebhookPayload({
      ...minimalValid,
      languages: ['ENGLISH'],
      languagesOther: 'Klingon, Esperanto',
    } as PartnerApplicationRequest);
    expect(payload.LanguagesSpoken).toEqual(['ENGLISH']);
    expect(payload.LanguagesOther).toBe('Klingon, Esperanto');
  });
});
