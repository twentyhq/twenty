import {
  INITIAL_PARTNER_APPLICATION_STATE,
  partnerApplicationReducer,
  type PartnerApplicationState,
} from '@/sections/PartnerApplication/wizard/use-partner-application-state';

const baseValidIdentity: Partial<PartnerApplicationState> = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
  website: 'https://analyticalengines.example',
};

describe('partnerApplicationReducer', () => {
  it('starts at stepIndex 0 with empty fields', () => {
    expect(INITIAL_PARTNER_APPLICATION_STATE.stepIndex).toBe(0);
    expect(INITIAL_PARTNER_APPLICATION_STATE.name).toBe('');
    expect(INITIAL_PARTNER_APPLICATION_STATE.partnerScope).toEqual([]);
  });

  it('SET_FIELD updates the field and clears any prior error for that field', () => {
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

  it('GO_NEXT on Identity step with missing required fields fills fieldErrors and stays put', () => {
    const next = partnerApplicationReducer(INITIAL_PARTNER_APPLICATION_STATE, {
      type: 'GO_NEXT',
    });
    expect(next.stepIndex).toBe(0);
    expect(Object.keys(next.fieldErrors).sort()).toEqual([
      'company',
      'email',
      'name',
      'website',
    ]);
  });

  it('GO_NEXT on Identity step with required fields valid advances to Profile', () => {
    const seeded: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      ...baseValidIdentity,
    } as PartnerApplicationState;
    const next = partnerApplicationReducer(seeded, { type: 'GO_NEXT' });
    expect(next.stepIndex).toBe(1);
    expect(next.fieldErrors).toEqual({});
  });

  it('GO_NEXT on Identity rejects malformed email', () => {
    const seeded: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      ...baseValidIdentity,
      email: 'not-an-email',
    } as PartnerApplicationState;
    const next = partnerApplicationReducer(seeded, { type: 'GO_NEXT' });
    expect(next.stepIndex).toBe(0);
    expect(next.fieldErrors.email).toBe('invalid_email');
  });

  it('GO_BACK clamps at 0 and clears errors', () => {
    const onProfileWithErrors: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 1,
      fieldErrors: { country: 'required' },
    };
    const next = partnerApplicationReducer(onProfileWithErrors, {
      type: 'GO_BACK',
    });
    expect(next.stepIndex).toBe(0);
    expect(next.fieldErrors).toEqual({});
    const clamped = partnerApplicationReducer(next, { type: 'GO_BACK' });
    expect(clamped.stepIndex).toBe(0);
  });

  it('SET_SUBMITTED flips isSubmitted to true and clears submitError + isSubmitting', () => {
    const seeded: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      isSubmitting: true,
      submitError: 'transient network error',
    };
    const next = partnerApplicationReducer(seeded, { type: 'SET_SUBMITTED' });
    expect(next.isSubmitted).toBe(true);
    expect(next.isSubmitting).toBe(false);
    expect(next.submitError).toBeNull();
  });

  it('RESET clears isSubmitted back to false', () => {
    const seeded: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      isSubmitted: true,
    };
    expect(partnerApplicationReducer(seeded, { type: 'RESET' })).toEqual(
      INITIAL_PARTNER_APPLICATION_STATE,
    );
  });

  it('RESET returns to initial state from any state', () => {
    const dirty: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      name: 'x',
      stepIndex: 3,
      isSubmitting: true,
    };
    expect(partnerApplicationReducer(dirty, { type: 'RESET' })).toEqual(
      INITIAL_PARTNER_APPLICATION_STATE,
    );
  });

  it('GO_NEXT on Profile requires country, typeOfTeam, and city', () => {
    const onProfile: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 1,
      country: 'FRANCE',
    };
    const blocked = partnerApplicationReducer(onProfile, { type: 'GO_NEXT' });
    expect(blocked.stepIndex).toBe(1);
    expect(blocked.fieldErrors.typeOfTeam).toBe('required');
    expect(blocked.fieldErrors.city).toBe('required');

    const ok = partnerApplicationReducer(
      { ...onProfile, typeOfTeam: 'SOLO', city: 'Paris' },
      { type: 'GO_NEXT' },
    );
    expect(ok.stepIndex).toBe(2);
    expect(ok.fieldErrors).toEqual({});
  });

  it('SET_FIELD sets applicationNotes', () => {
    const next = partnerApplicationReducer(INITIAL_PARTNER_APPLICATION_STATE, {
      type: 'SET_FIELD',
      field: 'applicationNotes',
      value: 'Workspace: https://x · refs: Acme',
    });
    expect(next.applicationNotes).toBe('Workspace: https://x · refs: Acme');
  });

  it('SET_FIELD_ERRORS replaces fieldErrors', () => {
    const next = partnerApplicationReducer(INITIAL_PARTNER_APPLICATION_STATE, {
      type: 'SET_FIELD_ERRORS',
      errors: { hourlyRate: 'required', projectBudgetMin: 'required' },
    });
    expect(next.fieldErrors).toEqual({
      hourlyRate: 'required',
      projectBudgetMin: 'required',
    });
  });

  it('flags Commercials required fields (hourlyRate, projectBudgetMin) when empty', () => {
    const onCommercials: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 3,
    };
    const blocked = partnerApplicationReducer(onCommercials, {
      type: 'GO_NEXT',
    });
    expect(blocked.fieldErrors.hourlyRate).toBe('required');
    expect(blocked.fieldErrors.projectBudgetMin).toBe('required');
  });
});
