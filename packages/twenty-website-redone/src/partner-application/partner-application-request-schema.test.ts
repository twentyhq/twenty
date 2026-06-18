import { partnerApplicationRequestSchema } from './partner-application-request-schema';

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
  partnerScope: ['ADVISORY', 'SOLUTIONING'],
  skills: ['React', 'TypeScript'],
  applicationNotes: 'Workspace https://app.twenty.com/ws/ada · refs: Acme',
  hourlyRate: 150,
  projectBudgetMin: 5000,
  calendarLink: 'https://cal.com/ada',
};

describe('partnerApplicationRequestSchema', () => {
  it('accepts the minimal required payload', () => {
    expect(
      partnerApplicationRequestSchema.safeParse(minimalValid).success,
    ).toBe(true);
  });

  it('accepts the full payload', () => {
    expect(partnerApplicationRequestSchema.safeParse(fullValid).success).toBe(
      true,
    );
  });

  it('rejects an unknown country enum value', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        country: 'ATLANTIS',
      }).success,
    ).toBe(false);
  });

  it('rejects an unknown scope enum value', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        partnerScope: ['NOPE'],
      }).success,
    ).toBe(false);
  });

  it('rejects unknown top-level keys (strictObject)', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        countryOther: 'Republic of Examples',
      }).success,
    ).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        email: 'not-an-email',
      }).success,
    ).toBe(false);
  });

  it('rejects a missing required field', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({ email: 'ada@example.com' })
        .success,
    ).toBe(false);
  });
});
