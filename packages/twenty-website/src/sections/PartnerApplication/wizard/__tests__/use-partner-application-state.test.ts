import {
  INITIAL_PARTNER_APPLICATION_STATE,
  partnerApplicationReducer,
  type PartnerApplicationState,
} from '@/sections/PartnerApplication/wizard/use-partner-application-state';

const baseValidIdentity: Partial<PartnerApplicationState> = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Ltd',
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
      value: 'APPS',
    });
    expect(added.partnerScope).toEqual(['APPS']);
    const removed = partnerApplicationReducer(added, {
      type: 'TOGGLE_SCOPE',
      value: 'APPS',
    });
    expect(removed.partnerScope).toEqual([]);
  });

  it('GO_NEXT on Identity step with missing required fields fills fieldErrors and stays put', () => {
    const next = partnerApplicationReducer(
      INITIAL_PARTNER_APPLICATION_STATE,
      { type: 'GO_NEXT' },
    );
    expect(next.stepIndex).toBe(0);
    expect(Object.keys(next.fieldErrors).sort()).toEqual(
      ['company', 'email', 'name'],
    );
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

  it('GO_NEXT on Profile requires country and reveals countryOther when OTHER', () => {
    const onProfile: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      stepIndex: 1,
      country: 'OTHER',
    };
    const next = partnerApplicationReducer(onProfile, { type: 'GO_NEXT' });
    expect(next.stepIndex).toBe(1);
    expect(next.fieldErrors.countryOther).toBe('required');
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

  it('TOGGLE_LANGUAGES_OTHER off clears any stale languagesOther error', () => {
    const seeded: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      languagesOtherSelected: true,
      languagesOther: 'Klingon',
      fieldErrors: { languagesOther: 'required' },
    };
    const off = partnerApplicationReducer(seeded, {
      type: 'TOGGLE_LANGUAGES_OTHER',
    });
    expect(off.languagesOtherSelected).toBe(false);
    expect(off.languagesOther).toBe('');
    expect(off.fieldErrors.languagesOther).toBeUndefined();
  });

  it('RESET returns to initial state from any state', () => {
    const dirty: PartnerApplicationState = {
      ...INITIAL_PARTNER_APPLICATION_STATE,
      name: 'x',
      stepIndex: 3,
      isSubmitting: true,
    };
    expect(
      partnerApplicationReducer(dirty, { type: 'RESET' }),
    ).toEqual(INITIAL_PARTNER_APPLICATION_STATE);
  });
});
