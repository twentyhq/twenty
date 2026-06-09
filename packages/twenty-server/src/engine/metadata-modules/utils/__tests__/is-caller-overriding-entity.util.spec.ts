import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';

const CUSTOM_APP_ID = 'custom-app-universal-id';
const OTHER_APP_ID = 'other-app-universal-id';

describe('isCallerOverridingEntity', () => {
  it('should return true when custom app updates a system-side-effect entity', () => {
    expect(
      isCallerOverridingEntity({
        callerApplicationUniversalIdentifier: CUSTOM_APP_ID,
        entityIsSystemSideEffect: true,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM_APP_ID,
      }),
    ).toBe(true);
  });

  it('should return false when custom app updates a non-system entity', () => {
    expect(
      isCallerOverridingEntity({
        callerApplicationUniversalIdentifier: CUSTOM_APP_ID,
        entityIsSystemSideEffect: false,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM_APP_ID,
      }),
    ).toBe(false);
  });

  it('should return false when a non-custom app updates a system-side-effect entity', () => {
    expect(
      isCallerOverridingEntity({
        callerApplicationUniversalIdentifier: OTHER_APP_ID,
        entityIsSystemSideEffect: true,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM_APP_ID,
      }),
    ).toBe(false);
  });
});
