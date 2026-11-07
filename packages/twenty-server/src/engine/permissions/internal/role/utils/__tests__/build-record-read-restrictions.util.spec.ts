import { type ObjectRecordsPermissions } from 'twenty-shared/types';

import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';

const buildObjectRecordsPermissions = (
  overrides: Partial<ObjectRecordsPermissions>,
): ObjectRecordsPermissions => ({
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  restrictedFields: {},
  ...overrides,
});

describe('buildRecordReadRestrictions', () => {
  it('should restrict nothing when no object has permissions', () => {
    expect(
      buildRecordReadRestrictions({ recordsPermissions: { objects: {} } }),
    ).toEqual({
      unreadableObjectMetadataIds: new Set(),
      unreadableFieldMetadataIds: new Set(),
    });
  });

  it('should list objects the role cannot read', () => {
    const { unreadableObjectMetadataIds } = buildRecordReadRestrictions({
      recordsPermissions: {
        objects: {
          readable: buildObjectRecordsPermissions({}),
          unreadable: buildObjectRecordsPermissions({
            canReadAllRecords: false,
          }),
        },
      },
    });

    expect(unreadableObjectMetadataIds).toEqual(new Set(['unreadable']));
  });

  it('should list only the fields denied for reading, across objects', () => {
    const { unreadableFieldMetadataIds } = buildRecordReadRestrictions({
      recordsPermissions: {
        objects: {
          person: buildObjectRecordsPermissions({
            restrictedFields: {
              jobTitle: { canRead: false, canUpdate: false },
              city: { canRead: true, canUpdate: false },
            },
          }),
          company: buildObjectRecordsPermissions({
            restrictedFields: { name: { canRead: false } },
          }),
        },
      },
    });

    expect(unreadableFieldMetadataIds).toEqual(new Set(['jobTitle', 'name']));
  });
});
