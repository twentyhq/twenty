import { applyAuthoredIsActive } from 'src/engine/metadata-modules/utils/apply-authored-is-active.util';
import { resetAuthoredOverrides } from 'src/engine/metadata-modules/utils/reset-authored-overrides.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const view = {
  applicationUniversalIdentifier: OWNER,
  isActive: true,
  overrides: { [CUSTOM]: { name: 'Mine' } },
  universalOverrides: { [CUSTOM]: { name: 'Mine' } },
};

describe('applyAuthoredIsActive', () => {
  it('writes a non-owner deactivation on both blobs and leaves the column', () => {
    expect(
      applyAuthoredIsActive({
        flatEntity: view,
        isActive: false,
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      ...view,
      overrides: { [CUSTOM]: { name: 'Mine', isActive: false } },
      universalOverrides: { [CUSTOM]: { name: 'Mine', isActive: false } },
    });
  });

  it('drops the entry when the restore matches the column', () => {
    expect(
      applyAuthoredIsActive({
        flatEntity: {
          ...view,
          overrides: { [CUSTOM]: { isActive: false } },
          universalOverrides: { [CUSTOM]: { isActive: false } },
        },
        isActive: true,
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ ...view, overrides: null, universalOverrides: null });
  });

  it('writes the column when the author owns the entity', () => {
    expect(
      applyAuthoredIsActive({
        flatEntity: view,
        isActive: false,
        authorUniversalIdentifier: OWNER,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ ...view, isActive: false });
  });

  it('writes the column for kinds without an overrides column', () => {
    const viewFilter = {
      applicationUniversalIdentifier: OWNER,
      isActive: true,
    };

    expect(
      applyAuthoredIsActive({
        flatEntity: viewFilter,
        isActive: false,
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ ...viewFilter, isActive: false });
  });
});

describe('resetAuthoredOverrides', () => {
  it('drops the caller entry on both blobs and keeps the others', () => {
    expect(
      resetAuthoredOverrides({
        flatEntity: {
          ...view,
          overrides: {
            [OWNER]: { isActive: false },
            [CUSTOM]: { name: 'Mine', isActive: false },
          },
          universalOverrides: { [CUSTOM]: { name: 'Mine', isActive: false } },
        },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      ...view,
      overrides: { [OWNER]: { isActive: false } },
      universalOverrides: null,
    });
  });
});
