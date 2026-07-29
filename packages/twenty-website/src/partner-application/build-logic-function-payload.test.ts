import { buildLogicFunctionPayload } from './build-logic-function-payload';
import { type PartnerApplicationRequest } from './partner-application-request-schema';

const validExperienceNotes =
  'Built a custom Twenty app for a property-management client, modeled leases and ' +
  'tenants as data models, automated renewal workflows, and shipped a front component ' +
  'for the broker dashboard with role-based views.';

const minimalValid: PartnerApplicationRequest = {
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

const fullValid: PartnerApplicationRequest = {
  ...minimalValid,
  linkedin: 'https://www.linkedin.com/in/ada',
  country: 'UNITED_KINGDOM',
  languages: ['ENGLISH', 'FRENCH'],
  typeOfTeam: 'SOLO',
  partnerScope: ['ADVISORY', 'SOLUTIONING'],
  skills: ['React', 'TypeScript'],
  calendarLink: 'https://cal.com/ada',
};

describe('buildLogicFunctionPayload', () => {
  it('splits firstName/lastName from name and uses camelCase keys', () => {
    const payload = buildLogicFunctionPayload(fullValid);
    expect(payload.firstName).toBe('Ada');
    expect(payload.lastName).toBe('Lovelace');
    expect(payload.email).toBe('ada@example.com');
    expect(payload.companyName).toBe('Analytical Engines Ltd');
    expect(payload.hourlyRate).toBe(150);
  });

  it('forwards website as domainName when provided', () => {
    expect(buildLogicFunctionPayload(fullValid).domainName).toBe(
      'https://analyticalengines.example',
    );
  });

  it('forwards twenty experience fields to the webhook payload', () => {
    const payload = buildLogicFunctionPayload(fullValid);
    expect(payload.twentyExperience).toEqual(['WORKFLOWS']);
    expect(payload.twentyExperienceNotes).toBe(validExperienceNotes);
    expect(payload.twentyExperienceProofLink).toBe(
      'https://www.loom.com/share/example',
    );
    expect(payload).not.toHaveProperty('applicationNotes');
  });

  it('omits keys for undefined optional fields', () => {
    const payload = buildLogicFunctionPayload(minimalValid);
    expect(payload).not.toHaveProperty('linkedin');
    expect(payload).not.toHaveProperty('country');
    expect(payload).not.toHaveProperty('languages');
    expect(payload).not.toHaveProperty('partnerScope');
  });

  it('omits empty arrays for optional multi-selects', () => {
    const payload = buildLogicFunctionPayload({
      ...minimalValid,
      languages: [],
      partnerScope: [],
      skills: [],
    });
    expect(payload).not.toHaveProperty('languages');
    expect(payload).not.toHaveProperty('partnerScope');
    expect(payload).not.toHaveProperty('skills');
  });
});
