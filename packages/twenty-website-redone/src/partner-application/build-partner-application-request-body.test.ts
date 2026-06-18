import { buildPartnerApplicationRequestBody } from './build-partner-application-request-body';
import {
  INITIAL_PARTNER_APPLICATION_STATE,
  type PartnerApplicationState,
} from './partner-application-state';

const minimalState: PartnerApplicationState = {
  ...INITIAL_PARTNER_APPLICATION_STATE,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
};

describe('buildPartnerApplicationRequestBody', () => {
  it('keeps only the required fields when optionals are empty', () => {
    expect(buildPartnerApplicationRequestBody(minimalState)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      company: 'Analytical Engines Ltd',
    });
  });

  it('trims the required string fields', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      name: '  Ada Lovelace  ',
      email: '  ada@example.com  ',
      company: '  Analytical Engines Ltd  ',
    });
    expect(body.name).toBe('Ada Lovelace');
    expect(body.email).toBe('ada@example.com');
    expect(body.company).toBe('Analytical Engines Ltd');
  });

  it('omits optional string fields that are blank or whitespace-only', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      website: '   ',
      linkedin: '',
      city: '  ',
      applicationNotes: '',
      calendarLink: '   ',
    });
    expect(body).not.toHaveProperty('website');
    expect(body).not.toHaveProperty('linkedin');
    expect(body).not.toHaveProperty('city');
    expect(body).not.toHaveProperty('applicationNotes');
    expect(body).not.toHaveProperty('calendarLink');
  });

  it('trims optional string fields when present', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      website: '  https://analyticalengines.example  ',
      linkedin: '  https://www.linkedin.com/in/ada  ',
      city: '  London  ',
      applicationNotes: '  refs: Acme  ',
      calendarLink: '  https://cal.com/ada  ',
    });
    expect(body.website).toBe('https://analyticalengines.example');
    expect(body.linkedin).toBe('https://www.linkedin.com/in/ada');
    expect(body.city).toBe('London');
    expect(body.applicationNotes).toBe('refs: Acme');
    expect(body.calendarLink).toBe('https://cal.com/ada');
  });

  it('omits enum/array fields when unset and forwards them when set', () => {
    const empty = buildPartnerApplicationRequestBody(minimalState);
    expect(empty).not.toHaveProperty('country');
    expect(empty).not.toHaveProperty('typeOfTeam');
    expect(empty).not.toHaveProperty('languages');
    expect(empty).not.toHaveProperty('partnerScope');
    expect(empty).not.toHaveProperty('skills');

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

  it('omits numeric fields that are blank, unparseable, or negative', () => {
    const blank = buildPartnerApplicationRequestBody({
      ...minimalState,
      hourlyRate: '',
      projectBudgetMin: 'abc',
    });
    expect(blank).not.toHaveProperty('hourlyRate');
    expect(blank).not.toHaveProperty('projectBudgetMin');

    const negative = buildPartnerApplicationRequestBody({
      ...minimalState,
      hourlyRate: '-5',
      projectBudgetMin: '-1',
    });
    expect(negative).not.toHaveProperty('hourlyRate');
    expect(negative).not.toHaveProperty('projectBudgetMin');
  });
});
