import { PARTNER_APPLICATION_STEP_IDS } from './data/partner-application-step-ids';
import { partnerApplicationReducer } from './partner-application-reducer';
import {
  INITIAL_PARTNER_APPLICATION_STATE,
  type PartnerApplicationState,
} from './partner-application-state';

const baseValidIdentity: Partial<PartnerApplicationState> = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
  website: 'https://analyticalengines.example',
};

const validExperienceNotes =
  'Built a custom Twenty app for a property-management client, modeled leases and ' +
  'tenants as data models, automated renewal workflows, and shipped a front component ' +
  'for the broker dashboard with role-based views.';

describe('partnerApplicationReducer', () => {
  it('orders steps identity → profile → expertise → experience → commercials', () => {
    expect(PARTNER_APPLICATION_STEP_IDS).toEqual([
      'identity',
      'profile',
      'expertise',
      'experience',
      'commercials',
    ]);
  });

  it('starts at stepIndex 0 with empty fields', () => {
    expect(INITIAL_PARTNER_APPLICATION_STATE.stepIndex).toBe(0);
    expect(INITIAL_PARTNER_APPLICATION_STATE.name).toBe('');
    expect(INITIAL_PARTNER_APPLICATION_STATE.partnerScope).toEqual([]);
    expect(INITIAL_PARTNER_APPLICATION_STATE.twentyExperience).toEqual([]);
  });

  it('SET_FIELD updates the field and clears any prior error for it', () => {
    const seeded: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      fieldErrors: { email: 'invalid_email' },
    };
    const next = partnerApplicationReducer(seeded, {
      type: 'SET_FIELD',
      field: 'email',
      value: 'ada@example.com',
    });
    expect(next.email).toBe('ada@example.com');
    expect(next.fieldErrors.email).toBeUndefined();
  });

  it('TOGGLE_SCOPE adds and then removes a scope value', () => {
    const added = partnerApplicationReducer(INITIAL_PARTNER_APPLICATION_STATE, {
      type: 'TOGGLE_SCOPE',
      value: 'ADVISORY',
    });
    expect(added.partnerScope).toEqual(['ADVISORY']);
    const removed = partnerApplicationReducer(added, {
      type: 'TOGGLE_SCOPE',
      value: 'ADVISORY',
    });
    expect(removed.partnerScope).toEqual([]);
  });

  it('TOGGLE_EXPERIENCE adds and then removes a milestone', () => {
    const added = partnerApplicationReducer(INITIAL_PARTNER_APPLICATION_STATE, {
      type: 'TOGGLE_EXPERIENCE',
      value: 'CUSTOM_APPS',
    });
    expect(added.twentyExperience).toEqual(['CUSTOM_APPS']);
    const removed = partnerApplicationReducer(added, {
      type: 'TOGGLE_EXPERIENCE',
      value: 'CUSTOM_APPS',
    });
    expect(removed.twentyExperience).toEqual([]);
  });

  it('GO_NEXT on Identity with missing required fields fills errors and stays', () => {
    const next = partnerApplicationReducer(INITIAL_PARTNER_APPLICATION_STATE, {
      type: 'GO_NEXT',
    });
    expect(next.stepIndex).toBe(0);
    expect(Object.keys(next.fieldErrors).toSorted()).toEqual([
      'company',
      'email',
      'name',
      'website',
    ]);
  });

  it('GO_NEXT on Identity with valid required fields advances to Profile', () => {
    const next = partnerApplicationReducer(
      { ...INITIAL_PARTNER_APPLICATION_STATE, ...baseValidIdentity },
      { type: 'GO_NEXT' },
    );
    expect(next.stepIndex).toBe(1);
    expect(next.fieldErrors).toEqual({});
  });

  it('GO_NEXT on Identity rejects a malformed email', () => {
    const next = partnerApplicationReducer(
      {
        ...INITIAL_PARTNER_APPLICATION_STATE,
        ...baseValidIdentity,
        email: 'not-an-email',
      },
      { type: 'GO_NEXT' },
    );
    expect(next.stepIndex).toBe(0);
    expect(next.fieldErrors.email).toBe('invalid_email');
  });

  it('GO_BACK clamps at 0 and clears errors', () => {
    const next = partnerApplicationReducer(
      {
        ...INITIAL_PARTNER_APPLICATION_STATE,
        stepIndex: 1,
        fieldErrors: { country: 'required' },
      },
      { type: 'GO_BACK' },
    );
    expect(next.stepIndex).toBe(0);
    expect(next.fieldErrors).toEqual({});
    expect(partnerApplicationReducer(next, { type: 'GO_BACK' }).stepIndex).toBe(
      0,
    );
  });

  it('GO_NEXT on Profile requires country and typeOfTeam', () => {
    const onProfile: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 1,
      country: 'FRANCE',
      city: 'Paris',
    };
    const blocked = partnerApplicationReducer(onProfile, { type: 'GO_NEXT' });
    expect(blocked.stepIndex).toBe(1);
    expect(blocked.fieldErrors.typeOfTeam).toBe('required');

    const ok = partnerApplicationReducer(
      { ...onProfile, typeOfTeam: 'SOLO' },
      { type: 'GO_NEXT' },
    );
    expect(ok.stepIndex).toBe(2);
    expect(ok.fieldErrors).toEqual({});
  });

  it('GO_NEXT on Expertise advances to Experience when partnerScope is set', () => {
    const onExpertise: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 2,
      partnerScope: ['ADVISORY'],
    };
    const next = partnerApplicationReducer(onExpertise, { type: 'GO_NEXT' });
    expect(next.stepIndex).toBe(3);
    expect(next.fieldErrors).toEqual({});
  });

  it('GO_NEXT on Experience gates on milestones, narrative length, and proof URL', () => {
    const onExperience: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 3,
    };
    const blocked = partnerApplicationReducer(onExperience, {
      type: 'GO_NEXT',
    });
    expect(blocked.stepIndex).toBe(3);
    expect(blocked.fieldErrors.twentyExperience).toBe('required');
    expect(blocked.fieldErrors.twentyExperienceNotes).toBe('required');
    expect(blocked.fieldErrors.twentyExperienceProofLink).toBe('required');

    const shortNotes = partnerApplicationReducer(
      {
        ...onExperience,
        twentyExperience: ['WORKFLOWS'],
        twentyExperienceNotes: 'Too short.',
        twentyExperienceProofLink: 'https://www.loom.com/share/example',
      },
      { type: 'GO_NEXT' },
    );
    expect(shortNotes.stepIndex).toBe(3);
    expect(shortNotes.fieldErrors.twentyExperienceNotes).toBe('too_short');

    const ok = partnerApplicationReducer(
      {
        ...onExperience,
        twentyExperience: ['WORKFLOWS'],
        twentyExperienceNotes: validExperienceNotes,
        twentyExperienceProofLink: 'https://www.loom.com/share/example',
      },
      { type: 'GO_NEXT' },
    );
    expect(ok.stepIndex).toBe(4);
    expect(ok.fieldErrors).toEqual({});
  });

  it('GO_NEXT on Commercials gates on hourly rate and minimum budget', () => {
    const onCommercials: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 4,
    };
    const blocked = partnerApplicationReducer(onCommercials, {
      type: 'GO_NEXT',
    });
    expect(blocked.fieldErrors.hourlyRate).toBe('required');
    expect(blocked.fieldErrors.projectBudgetMin).toBe('required');

    const badAmount = partnerApplicationReducer(
      { ...onCommercials, hourlyRate: '.', projectBudgetMin: '5000' },
      { type: 'GO_NEXT' },
    );
    expect(badAmount.fieldErrors.hourlyRate).toBe('invalid_amount');

    const ok = partnerApplicationReducer(
      { ...onCommercials, hourlyRate: '150', projectBudgetMin: '5000' },
      { type: 'GO_NEXT' },
    );
    expect(ok.fieldErrors).toEqual({});
  });

  it('SET_SUBMITTED flips isSubmitted and clears submitError + isSubmitting', () => {
    const next = partnerApplicationReducer(
      {
        ...INITIAL_PARTNER_APPLICATION_STATE,
        isSubmitting: true,
        submitError: 'transient network error',
      },
      { type: 'SET_SUBMITTED' },
    );
    expect(next.isSubmitted).toBe(true);
    expect(next.isSubmitting).toBe(false);
    expect(next.submitError).toBeNull();
  });

  it('RESET returns to the initial state from any state', () => {
    const dirty: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      name: 'x',
      stepIndex: 4,
      isSubmitting: true,
      isSubmitted: true,
    };
    expect(partnerApplicationReducer(dirty, { type: 'RESET' })).toEqual(
      INITIAL_PARTNER_APPLICATION_STATE,
    );
  });
});
