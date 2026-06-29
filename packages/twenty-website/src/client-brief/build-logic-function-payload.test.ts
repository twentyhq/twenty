import { buildLogicFunctionPayload } from './build-logic-function-payload';
import { type ClientBriefRequest } from './client-brief-request-schema';

const minimalValid: ClientBriefRequest = {
  firstName: 'Jane',
  lastName: '',
  email: 'jane@acme.com',
  companyName: 'Acme Real Estate',
  need: 'Migrate from HubSpot',
};

const fullValid: ClientBriefRequest = {
  ...minimalValid,
  lastName: 'Smith',
  requirements: 'French UI required',
  hostingType: 'CLOUD',
  country: 'France',
  languages: ['French', 'English'],
  seatCount: '~30',
  timeline: 'Before Q4',
  budgetRange: '$10k–$25k',
};

describe('buildLogicFunctionPayload', () => {
  it('forwards required fields unchanged', () => {
    const payload = buildLogicFunctionPayload(fullValid);
    expect(payload.firstName).toBe('Jane');
    expect(payload.lastName).toBe('Smith');
    expect(payload.email).toBe('jane@acme.com');
    expect(payload.companyName).toBe('Acme Real Estate');
    expect(payload.need).toBe('Migrate from HubSpot');
  });

  it('forwards optional context fields when provided', () => {
    const payload = buildLogicFunctionPayload(fullValid);
    expect(payload.requirements).toBe('French UI required');
    expect(payload.hostingType).toBe('CLOUD');
    expect(payload.languages).toEqual(['French', 'English']);
  });

  it('omits keys for undefined optional fields', () => {
    const payload = buildLogicFunctionPayload(minimalValid);
    expect(payload).not.toHaveProperty('requirements');
    expect(payload).not.toHaveProperty('hostingType');
    expect(payload).not.toHaveProperty('languages');
  });

  it('omits empty language arrays', () => {
    const payload = buildLogicFunctionPayload({
      ...minimalValid,
      languages: [],
    });
    expect(payload).not.toHaveProperty('languages');
  });
});
