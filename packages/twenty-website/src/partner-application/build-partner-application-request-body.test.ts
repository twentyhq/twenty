import { buildPartnerApplicationRequestBody } from './build-partner-application-request-body';
import {
  INITIAL_PARTNER_APPLICATION_STATE,
  type PartnerApplicationState,
} from './partner-application-state';

const validExperienceNotes =
  'Built a custom Twenty app for a property-management client, modeled leases and ' +
  'tenants as data models, automated renewal workflows, and shipped a front component ' +
  'for the broker dashboard with role-based views.';

const minimalState: PartnerApplicationState = {
  ...INITIAL_PARTNER_APPLICATION_STATE,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
  website: 'https://analyticalengines.example',
  city: 'London',
  hourlyRate: '150',
  projectBudgetMin: '5000',
  twentyExperience: ['WORKFLOWS'],
  twentyExperienceNotes: validExperienceNotes,
  twentyExperienceProofLink: 'https://www.loom.com/share/example',
};

describe('buildPartnerApplicationRequestBody', () => {
  it('includes required fields and experience data', () => {
    expect(buildPartnerApplicationRequestBody(minimalState)).toEqual({
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
    });
  });

  it('trims the required string fields', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      name: '  Ada Lovelace  ',
      email: '  ada@example.com  ',
      company: '  Analytical Engines Ltd  ',
      twentyExperienceNotes: `  ${validExperienceNotes}  `,
      twentyExperienceProofLink: '  https://www.loom.com/share/example  ',
    });
    expect(body.name).toBe('Ada Lovelace');
    expect(body.email).toBe('ada@example.com');
    expect(body.company).toBe('Analytical Engines Ltd');
    expect(body.twentyExperienceNotes).toBe(validExperienceNotes);
    expect(body.twentyExperienceProofLink).toBe(
      'https://www.loom.com/share/example',
    );
  });

  it('omits optional string fields that are blank or whitespace-only', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      linkedin: '',
      calendarLink: '   ',
    });
    expect(body).not.toHaveProperty('linkedin');
    expect(body).not.toHaveProperty('calendarLink');
    expect(body).not.toHaveProperty('applicationNotes');
  });

  it('trims optional string fields when present', () => {
    const body = buildPartnerApplicationRequestBody({
      ...minimalState,
      website: '  https://analyticalengines.example  ',
      linkedin: '  https://www.linkedin.com/in/ada  ',
      city: '  London  ',
      calendarLink: '  https://cal.com/ada  ',
    });
    expect(body.website).toBe('https://analyticalengines.example');
    expect(body.linkedin).toBe('https://www.linkedin.com/in/ada');
    expect(body.city).toBe('London');
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
      twentyExperience: ['CUSTOM_APPS', 'FRONT_COMPONENTS'],
    });
    expect(filled.country).toBe('UNITED_KINGDOM');
    expect(filled.typeOfTeam).toBe('SOLO');
    expect(filled.languages).toEqual(['ENGLISH', 'FRENCH']);
    expect(filled.partnerScope).toEqual(['ADVISORY', 'SOLUTIONING']);
    expect(filled.skills).toEqual(['React', 'TypeScript']);
    expect(filled.twentyExperience).toEqual([
      'CUSTOM_APPS',
      'FRONT_COMPONENTS',
    ]);
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
