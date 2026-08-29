import { buildClientBriefRequestBody } from './build-client-brief-request-body';
import { INITIAL_CLIENT_BRIEF_STATE } from './client-brief-state';

const state = {
  ...INITIAL_CLIENT_BRIEF_STATE,
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@acme.com',
  companyName: 'Acme Real Estate',
  need: 'Migrate from HubSpot',
};

describe('buildClientBriefRequestBody', () => {
  it('puts the referring partner slug on the wire', () => {
    expect(
      buildClientBriefRequestBody(state, 'acme-consulting').partnerSlug,
    ).toBe('acme-consulting');
  });

  it('omits the key entirely when no slug is given', () => {
    expect('partnerSlug' in buildClientBriefRequestBody(state)).toBe(false);
  });
});
