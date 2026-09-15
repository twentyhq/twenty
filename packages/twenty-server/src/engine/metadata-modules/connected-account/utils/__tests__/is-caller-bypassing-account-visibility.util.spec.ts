import { isCallerBypassingAccountVisibility } from 'src/engine/metadata-modules/connected-account/utils/is-caller-bypassing-account-visibility.util';

describe('isCallerBypassingAccountVisibility', () => {
  it.each(['application', 'system'] as const)(
    'accepts a %s run, the workspace acts on itself',
    (callerType) => {
      expect(isCallerBypassingAccountVisibility(callerType)).toBe(true);
    },
  );

  it.each(['user', 'apiKey', 'pendingActivationUser'] as const)(
    'rejects a %s caller, it is held to account visibility',
    (callerType) => {
      expect(isCallerBypassingAccountVisibility(callerType)).toBe(false);
    },
  );

  it('rejects an unidentified caller', () => {
    expect(isCallerBypassingAccountVisibility(undefined)).toBe(false);
  });
});
