import { buildLogicFunctionPayload } from './build-logic-function-payload';
import { type PartnerApplicationRequest } from './partner-application-request-schema';

const minimalValid: PartnerApplicationRequest = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
};

const fullValid: PartnerApplicationRequest = {
  ...minimalValid,
  website: 'https://analyticalengines.example',
  linkedin: 'https://www.linkedin.com/in/ada',
  city: 'London',
  country: 'UNITED_KINGDOM',
  languages: ['ENGLISH', 'FRENCH'],
  typeOfTeam: 'SOLO',
  partnerScope: ['ADVISORY', 'SOLUTIONING'],
  skills: ['React', 'TypeScript'],
  applicationNotes: 'refs: Acme, Globex',
  hourlyRate: 150,
  projectBudgetMin: 5000,
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

  it('forwards applicationNotes through to the payload', () => {
    expect(buildLogicFunctionPayload(fullValid).applicationNotes).toContain(
      'Acme',
    );
  });

  it('omits keys for undefined optional fields', () => {
    const payload = buildLogicFunctionPayload(minimalValid);
    expect(payload).not.toHaveProperty('linkedin');
    expect(payload).not.toHaveProperty('country');
    expect(payload).not.toHaveProperty('languages');
    expect(payload).not.toHaveProperty('partnerScope');
    expect(payload).not.toHaveProperty('domainName');
  });

  it('omits empty arrays', () => {
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
