import { buildClientBriefRequestBody } from './build-client-brief-request-body';
import { INITIAL_CLIENT_BRIEF_STATE } from './client-brief-state';

describe('buildClientBriefRequestBody', () => {
  it('builds the minimal request from identity + brief fields', () => {
    expect(
      buildClientBriefRequestBody({
        ...INITIAL_CLIENT_BRIEF_STATE,
        need: 'Set up CRM pipelines',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@acme.com',
        companyName: 'Acme Real Estate',
      }),
    ).toEqual({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@acme.com',
      companyName: 'Acme Real Estate',
      need: 'Set up CRM pipelines',
    });
  });

  it('splits languages on commas and omits empty optional fields', () => {
    expect(
      buildClientBriefRequestBody({
        ...INITIAL_CLIENT_BRIEF_STATE,
        need: 'Help',
        firstName: 'Jane',
        email: 'jane@acme.com',
        companyName: 'Acme',
        requirements: 'French UI',
        hostingType: 'CLOUD',
        country: 'France',
        languages: 'French, English , ',
        seatCount: '~30',
        timeline: 'Before Q4',
        budgetRange: '$10k–$25k',
      }),
    ).toEqual({
      firstName: 'Jane',
      lastName: '',
      email: 'jane@acme.com',
      companyName: 'Acme',
      need: 'Help',
      requirements: 'French UI',
      hostingType: 'CLOUD',
      country: 'France',
      languages: ['French', 'English'],
      seatCount: '~30',
      timeline: 'Before Q4',
      budgetRange: '$10k–$25k',
    });
  });
});
