import { splitEntitiesByResetStrategy } from 'src/engine/metadata-modules/flat-entity/utils/split-entities-by-reset-strategy.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';
const NOW = '2026-01-01T00:00:00.000Z';

describe('splitEntitiesByResetStrategy', () => {
  it('hard deletes a row the custom application owns outright', () => {
    const customViewField = {
      applicationUniversalIdentifier: CUSTOM,
      isActive: true,
      isSystemSideEffect: false,
      overrides: null,
    };

    expect(
      splitEntitiesByResetStrategy({
        entities: [customViewField],
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        now: NOW,
      }),
    ).toEqual({ toHardDelete: [customViewField], toReset: [] });
  });

  it('drops the custom entry of a row another application owns and leaves the column', () => {
    const deactivatedViewField = {
      applicationUniversalIdentifier: OWNER,
      isActive: true,
      isSystemSideEffect: false,
      overrides: { [CUSTOM]: { isActive: false }, [OWNER]: { size: 42 } },
    };

    expect(
      splitEntitiesByResetStrategy({
        entities: [deactivatedViewField],
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        now: NOW,
      }),
    ).toEqual({
      toHardDelete: [],
      toReset: [
        {
          ...deactivatedViewField,
          overrides: { [OWNER]: { size: 42 } },
          updatedAt: NOW,
        },
      ],
    });
  });

  it('resets an engine-managed row the custom application owns', () => {
    const engineManagedViewField = {
      applicationUniversalIdentifier: CUSTOM,
      isActive: true,
      isSystemSideEffect: true,
      overrides: { [CUSTOM]: { isActive: false } },
    };

    expect(
      splitEntitiesByResetStrategy({
        entities: [engineManagedViewField],
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        now: NOW,
      }),
    ).toEqual({
      toHardDelete: [],
      toReset: [{ ...engineManagedViewField, overrides: null, updatedAt: NOW }],
    });
  });
});
