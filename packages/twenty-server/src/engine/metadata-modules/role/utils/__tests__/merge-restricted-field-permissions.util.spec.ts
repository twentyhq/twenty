import { mergeRestrictedFieldPermissions } from 'src/engine/metadata-modules/role/utils/merge-restricted-field-permissions.util';

describe('mergeRestrictedFieldPermissions', () => {
  it('returns the incoming restriction when nothing restricts the column yet', () => {
    expect(
      mergeRestrictedFieldPermissions({
        existing: undefined,
        incoming: { canRead: false, canUpdate: null },
      }),
    ).toEqual({ canRead: false, canUpdate: null });
  });

  it('keeps a denial from either side', () => {
    expect(
      mergeRestrictedFieldPermissions({
        existing: { canRead: false, canUpdate: null },
        incoming: { canRead: null, canUpdate: false },
      }),
    ).toEqual({ canRead: false, canUpdate: false });
  });

  it('lets the incoming value fill what the existing one leaves unset', () => {
    expect(
      mergeRestrictedFieldPermissions({
        existing: { canRead: null, canUpdate: true },
        incoming: { canRead: true, canUpdate: null },
      }),
    ).toEqual({ canRead: true, canUpdate: true });
  });
});
