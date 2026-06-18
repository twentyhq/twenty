import {
  buildPartnerApplicationRequestBody,
  INITIAL_PARTNER_APPLICATION_STATE,
  type PartnerApplicationState,
} from '@/sections/PartnerApplication/wizard/use-partner-application-state';

const minimalState: PartnerApplicationState = {
  ...INITIAL_PARTNER_APPLICATION_STATE,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
  website: 'https://analyticalengines.example',
  city: 'London',
  hourlyRate: '150',
  projectBudgetMin: '5000',
};

describe('buildPartnerApplicationRequestBody', () => {
  it('keeps only the required fields when optionals are empty', () => {
    const body = buildPartnerApplicationRequestBody(minimalState);
    expect(body).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      company: 'Analytical Engines Ltd',
      website: 'https://analyticalengines.example',
      city: 'London',
      hourlyRate: 150,
      projectBudgetMin: 5000,
    });
  });

  it('trims the required string fields', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      name: '  Ada Lovelace  ',
      email: '  ada@example.com  ',
      company: '  Analytical Engines Ltd  ',
      website: '  https://analyticalengines.example  ',
      city: '  London  ',
    });
    expect(body.name).toBe('Ada Lovelace');
    expect(body.email).toBe('ada@example.com');
    expect(body.company).toBe('Analytical Engines Ltd');
    expect(body.website).toBe('https://analyticalengines.example');
    expect(body.city).toBe('London');
  });

  it('omits optional string fields that are blank or whitespace-only', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      linkedin: '',
      applicationNotes: '',
      calendarLink: '   ',
    });
    expect('linkedin' in body).toBe(false);
    expect('applicationNotes' in body).toBe(false);
    expect('calendarLink' in body).toBe(false);
  });

  it('trims optional string fields when present', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      linkedin: '  https://www.linkedin.com/in/ada  ',
      applicationNotes: '  refs: Acme  ',
      calendarLink: '  https://cal.com/ada  ',
    });
    expect(body.linkedin).toBe('https://www.linkedin.com/in/ada');
    expect(body.applicationNotes).toBe('refs: Acme');
    expect(body.calendarLink).toBe('https://cal.com/ada');
  });

  it('omits enum/array fields when unset and forwards them when set', () => {
    const empty = buildPartnerApplicationRequestBody(minimalState);
    expect('country' in empty).toBe(false);
    expect('typeOfTeam' in empty).toBe(false);
    expect('languages' in empty).toBe(false);
    expect('partnerScope' in empty).toBe(false);
    expect('skills' in empty).toBe(false);

    const filled = buildPartnerApplicationRequestBody({
      ...minimalState,
      country: 'UNITED_KINGDOM',
      typeOfTeam: 'SOLO',
      languages: ['ENGLISH', 'FRENCH'],
      partnerScope: ['ADVISORY', 'SOLUTIONING'],
      skills: ['React', 'TypeScript'],
    });
    expect(filled.country).toBe('UNITED_KINGDOM');
    expect(filled.typeOfTeam).toBe('SOLO');
    expect(filled.languages).toEqual(['ENGLISH', 'FRENCH']);
    expect(filled.partnerScope).toEqual(['ADVISORY', 'SOLUTIONING']);
    expect(filled.skills).toEqual(['React', 'TypeScript']);
  });

  it('parses hourlyRate and projectBudgetMin into non-negative numbers', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      hourlyRate: '150',
      projectBudgetMin: '5000',
    });
    expect(body.hourlyRate).toBe(150);
    expect(body.projectBudgetMin).toBe(5000);
  });
});
