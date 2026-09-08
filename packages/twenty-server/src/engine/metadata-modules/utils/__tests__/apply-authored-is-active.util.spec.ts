import { applyAuthoredIsActive } from 'src/engine/metadata-modules/utils/apply-authored-is-active.util';
import { applyOwnerAuthoredIsActive } from 'src/engine/metadata-modules/utils/apply-owner-authored-is-active.util';
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
  it('attributes a non-owner deactivation on both blobs and the column', () => {
    expect(
      applyAuthoredIsActive({
        flatEntity: view,
        isActive: false,
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      ...view,
      isActive: false,
      overrides: { [CUSTOM]: { name: 'Mine', isActive: false } },
      universalOverrides: { [CUSTOM]: { name: 'Mine', isActive: false } },
    });
  });

  it('writes the column only when the author owns the entity', () => {
    expect(
      applyAuthoredIsActive({
        flatEntity: view,
        isActive: false,
        authorUniversalIdentifier: OWNER,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ ...view, isActive: false });
  });

  it('writes the column only for kinds without an overrides column', () => {
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
  it('drops the caller entry and materializes isActive from what remains', () => {
    expect(
      resetAuthoredOverrides({
        flatEntity: {
          ...view,
          isActive: false,
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
      isActive: false,
      overrides: { [OWNER]: { isActive: false } },
      universalOverrides: null,
    });
  });

  it('reactivates once no entry deactivates the entity', () => {
    expect(
      resetAuthoredOverrides({
        flatEntity: { ...view, isActive: false },
        authorUniversalIdentifier: CUSTOM,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      ...view,
      isActive: true,
      overrides: null,
      universalOverrides: null,
    });
  });
});

describe('applyOwnerAuthoredIsActive', () => {
  it('attributes to the owner and keeps the custom entry ranking first', () => {
    expect(
      applyOwnerAuthoredIsActive({ flatEntity: view, isActive: false }),
    ).toEqual({
      ...view,
      isActive: false,
      overrides: { [CUSTOM]: { name: 'Mine' }, [OWNER]: { isActive: false } },
      universalOverrides: {
        [CUSTOM]: { name: 'Mine' },
        [OWNER]: { isActive: false },
      },
    });
  });

  it('removes the owner attribution on reactivation', () => {
    expect(
      applyOwnerAuthoredIsActive({
        flatEntity: {
          ...view,
          isActive: false,
          overrides: { [OWNER]: { isActive: false } },
          universalOverrides: { [OWNER]: { isActive: false } },
        },
        isActive: true,
      }),
    ).toEqual({
      ...view,
      isActive: true,
      overrides: null,
      universalOverrides: null,
    });
  });

  it('falls back to a column-only write on a flat blob it cannot key', () => {
    const legacy = {
      ...view,
      overrides: { name: 'Legacy' },
      universalOverrides: { name: 'Legacy' },
    };

    expect(
      applyOwnerAuthoredIsActive({ flatEntity: legacy, isActive: false }),
    ).toEqual({
      ...legacy,
      isActive: false,
    });
  });
});
