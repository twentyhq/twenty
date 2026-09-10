import { resetAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/reset-authored-overrides.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const view = {
  applicationUniversalIdentifier: OWNER,
  isActive: true,
  overrides: { [CUSTOM]: { name: 'Mine' } } as unknown,
  universalOverrides: { [CUSTOM]: { name: 'Mine' } } as unknown,
};

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
      }),
    ).toEqual({
      ...view,
      overrides: { [OWNER]: { isActive: false } },
      universalOverrides: null,
    });
  });

  it('leaves the column alone', () => {
    expect(
      resetAuthoredOverrides({
        flatEntity: { ...view, isActive: false },
        authorUniversalIdentifier: CUSTOM,
      }).isActive,
    ).toBe(false);
  });

  it('only touches overrides on a kind without a universal twin', () => {
    const { universalOverrides: _universalOverrides, ...tab } = view;

    expect(
      resetAuthoredOverrides({
        flatEntity: tab,
        authorUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ ...tab, overrides: null });
  });
});
