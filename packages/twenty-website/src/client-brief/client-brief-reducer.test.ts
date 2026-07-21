import { clientBriefReducer } from './client-brief-reducer';
import {
  INITIAL_CLIENT_BRIEF_STATE,
  type ClientBriefState,
} from './client-brief-state';

const baseValidBrief: Partial<ClientBriefState> = {
  need: 'Migrate from HubSpot to Twenty',
};

const baseValidIdentity: Partial<ClientBriefState> = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@acme.com',
  companyName: 'Acme Real Estate',
};

describe('clientBriefReducer', () => {
  it('starts at stepIndex 0 with empty fields', () => {
    expect(INITIAL_CLIENT_BRIEF_STATE.stepIndex).toBe(0);
    expect(INITIAL_CLIENT_BRIEF_STATE.need).toBe('');
    expect(INITIAL_CLIENT_BRIEF_STATE.firstName).toBe('');
  });

  it('SET_FIELD updates the field and clears any prior error for it', () => {
    const seeded: ClientBriefState = {
      ...INITIAL_CLIENT_BRIEF_STATE,
      fieldErrors: { email: 'invalid_email' },
    };
    const next = clientBriefReducer(seeded, {
      type: 'SET_FIELD',
      field: 'email',
      value: 'jane@acme.com',
    });
    expect(next.email).toBe('jane@acme.com');
    expect(next.fieldErrors.email).toBeUndefined();
  });

  it('SET_FIELD_ERRORS updates fieldErrors without advancing the step', () => {
    const onIdentity: ClientBriefState = {
      ...INITIAL_CLIENT_BRIEF_STATE,
      stepIndex: 2,
      ...baseValidBrief,
    };
    const next = clientBriefReducer(onIdentity, {
      type: 'SET_FIELD_ERRORS',
      errors: { email: 'invalid_email' },
    });
    expect(next.stepIndex).toBe(2);
    expect(next.fieldErrors.email).toBe('invalid_email');
  });

  it('GO_NEXT on brief with missing need fills errors and stays', () => {
    const next = clientBriefReducer(INITIAL_CLIENT_BRIEF_STATE, {
      type: 'GO_NEXT',
    });
    expect(next.stepIndex).toBe(0);
    expect(next.fieldErrors.need).toBe('required');
  });

  it('GO_NEXT on brief with valid need advances to context', () => {
    const next = clientBriefReducer(
      { ...INITIAL_CLIENT_BRIEF_STATE, ...baseValidBrief },
      { type: 'GO_NEXT' },
    );
    expect(next.stepIndex).toBe(1);
    expect(next.fieldErrors).toEqual({});
  });

  it('SKIP_CONTEXT jumps from context to identity', () => {
    const onContext: ClientBriefState = {
      ...INITIAL_CLIENT_BRIEF_STATE,
      stepIndex: 1,
      ...baseValidBrief,
    };
    const next = clientBriefReducer(onContext, { type: 'SKIP_CONTEXT' });
    expect(next.stepIndex).toBe(2);
    expect(next.fieldErrors).toEqual({});
  });

  it('SKIP_CONTEXT is a no-op when not on context step', () => {
    const onBrief = clientBriefReducer(INITIAL_CLIENT_BRIEF_STATE, {
      type: 'SKIP_CONTEXT',
    });
    expect(onBrief.stepIndex).toBe(0);

    const onIdentity: ClientBriefState = {
      ...INITIAL_CLIENT_BRIEF_STATE,
      stepIndex: 2,
    };
    const stillIdentity = clientBriefReducer(onIdentity, {
      type: 'SKIP_CONTEXT',
    });
    expect(stillIdentity.stepIndex).toBe(2);
  });

  it('GO_NEXT on context advances to identity without required fields', () => {
    const onContext: ClientBriefState = {
      ...INITIAL_CLIENT_BRIEF_STATE,
      stepIndex: 1,
      ...baseValidBrief,
    };
    const next = clientBriefReducer(onContext, { type: 'GO_NEXT' });
    expect(next.stepIndex).toBe(2);
    expect(next.fieldErrors).toEqual({});
  });

  it('GO_NEXT on identity requires firstName, email, and companyName', () => {
    const onIdentity: ClientBriefState = {
      ...INITIAL_CLIENT_BRIEF_STATE,
      stepIndex: 2,
      ...baseValidBrief,
    };
    const blocked = clientBriefReducer(onIdentity, { type: 'GO_NEXT' });
    expect(blocked.stepIndex).toBe(2);
    expect(Object.keys(blocked.fieldErrors).toSorted()).toEqual([
      'companyName',
      'email',
      'firstName',
    ]);
  });

  it('GO_NEXT on identity rejects a malformed email', () => {
    const next = clientBriefReducer(
      {
        ...INITIAL_CLIENT_BRIEF_STATE,
        stepIndex: 2,
        ...baseValidBrief,
        ...baseValidIdentity,
        email: 'not-an-email',
      },
      { type: 'GO_NEXT' },
    );
    expect(next.stepIndex).toBe(2);
    expect(next.fieldErrors.email).toBe('invalid_email');
  });

  it('GO_NEXT on identity with valid fields stays on identity (submit step)', () => {
    const next = clientBriefReducer(
      {
        ...INITIAL_CLIENT_BRIEF_STATE,
        stepIndex: 2,
        ...baseValidBrief,
        ...baseValidIdentity,
      },
      { type: 'GO_NEXT' },
    );
    expect(next.stepIndex).toBe(2);
    expect(next.fieldErrors).toEqual({});
  });

  it('GO_BACK reverses steps and clears errors', () => {
    const onIdentity: ClientBriefState = {
      ...INITIAL_CLIENT_BRIEF_STATE,
      stepIndex: 2,
      fieldErrors: { email: 'required' },
    };
    const onContext = clientBriefReducer(onIdentity, { type: 'GO_BACK' });
    expect(onContext.stepIndex).toBe(1);
    expect(onContext.fieldErrors).toEqual({});

    const onBrief = clientBriefReducer(onContext, { type: 'GO_BACK' });
    expect(onBrief.stepIndex).toBe(0);

    expect(clientBriefReducer(onBrief, { type: 'GO_BACK' }).stepIndex).toBe(0);
  });

  it('SET_SUBMITTED flips isSubmitted and clears submitError + isSubmitting', () => {
    const next = clientBriefReducer(
      {
        ...INITIAL_CLIENT_BRIEF_STATE,
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
    const dirty: ClientBriefState = {
      ...INITIAL_CLIENT_BRIEF_STATE,
      need: 'x',
      stepIndex: 2,
      isSubmitting: true,
      isSubmitted: true,
    };
    expect(clientBriefReducer(dirty, { type: 'RESET' })).toEqual(
      INITIAL_CLIENT_BRIEF_STATE,
    );
  });
});
