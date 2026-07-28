import { INITIAL_PARTNER_APPLICATION_STATE } from './partner-application-state';
import { validatePartnerApplicationStep } from './validate-partner-application-step';

const validExperienceNotes =
  'Built a custom Twenty app for a property-management client, modeled leases and ' +
  'tenants as data models, automated renewal workflows, and shipped a front component ' +
  'for the broker dashboard with role-based views.';

describe('validatePartnerApplicationStep', () => {
  it('requires experience milestones, narrative, and proof URL on Experience', () => {
    const errors = validatePartnerApplicationStep({
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 3,
    });
    expect(errors.twentyExperience).toBe('required');
    expect(errors.twentyExperienceNotes).toBe('required');
    expect(errors.twentyExperienceProofLink).toBe('required');
  });

  it('rejects a narrative under 200 characters on Experience', () => {
    const errors = validatePartnerApplicationStep({
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 3,
      twentyExperience: ['WORKFLOWS'],
      twentyExperienceNotes: 'Too short for a real implementation narrative.',
      twentyExperienceProofLink: 'https://www.loom.com/share/example',
    });
    expect(errors.twentyExperienceNotes).toBe('too_short');
  });

  it('rejects an invalid proof URL on Experience', () => {
    const errors = validatePartnerApplicationStep({
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 3,
      twentyExperience: ['CUSTOM_APPS'],
      twentyExperienceNotes: validExperienceNotes,
      twentyExperienceProofLink: 'not-a-url',
    });
    expect(errors.twentyExperienceProofLink).toBe('invalid_url');
  });

  it('accepts a complete Experience step', () => {
    const errors = validatePartnerApplicationStep({
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 3,
      twentyExperience: ['CUSTOM_APPS', 'DATA_MODELS'],
      twentyExperienceNotes: validExperienceNotes,
      twentyExperienceProofLink: 'https://www.loom.com/share/example',
    });
    expect(errors).toEqual({});
  });
});
