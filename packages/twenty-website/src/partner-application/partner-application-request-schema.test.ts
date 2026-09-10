import { partnerApplicationRequestSchema } from './partner-application-request-schema';

const validExperienceNotes =
  'Built a custom Twenty app for a property-management client, modeled leases and ' +
  'tenants as data models, automated renewal workflows, and shipped a front component ' +
  'for the broker dashboard with role-based views.';

const minimalValid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
  website: 'https://analyticalengines.example',
  city: 'London',
  hourlyRate: 150,
  projectBudgetMin: 5000,
  twentyExperience: ['WORKFLOWS'],
  twentyExperienceNotes: validExperienceNotes,
  twentyExperienceProofLink: 'https://www.loom.com/share/example',
};

const fullValid = {
  ...minimalValid,
  linkedin: 'https://www.linkedin.com/in/ada',
  country: 'UNITED_KINGDOM',
  languages: ['ENGLISH', 'FRENCH'],
  typeOfTeam: 'SOLO',
  partnerScope: ['ADVISORY', 'SOLUTIONING'],
  skills: ['React', 'TypeScript'],
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

  it('rejects legacy applicationNotes', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        applicationNotes: 'Workspace URL and refs',
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

  it('rejects when a newly-required field is missing', () => {
    for (const field of [
      'website',
      'city',
      'hourlyRate',
      'projectBudgetMin',
      'twentyExperience',
      'twentyExperienceNotes',
      'twentyExperienceProofLink',
    ]) {
      const withoutField = Object.fromEntries(
        Object.entries(minimalValid).filter(([key]) => key !== field),
      );
      expect(
        partnerApplicationRequestSchema.safeParse(withoutField).success,
      ).toBe(false);
    }
  });

  it('rejects empty twentyExperience', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        twentyExperience: [],
      }).success,
    ).toBe(false);
  });

  it('rejects an unknown twentyExperience milestone', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        twentyExperience: ['INTEGRATIONS'],
      }).success,
    ).toBe(false);
  });

  it('rejects twentyExperienceNotes shorter than 200 characters', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        twentyExperienceNotes: 'Too short for a real implementation narrative.',
      }).success,
    ).toBe(false);
  });

  it('rejects an invalid twentyExperienceProofLink', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        twentyExperienceProofLink: 'not-a-url',
      }).success,
    ).toBe(false);
  });

  it('rejects a negative hourly rate', () => {
    expect(
      partnerApplicationRequestSchema.safeParse({
        ...minimalValid,
        hourlyRate: -5,
      }).success,
    ).toBe(false);
  });
});
