import {
  type ObjectRecordsPermissions,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { computePermissionUnion } from 'src/engine/permissions/internal/role/utils/compute-permission-union.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_ID = 'object-1';

const NO_OBJECT_ACCESS: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
};

const buildReadRule = (
  rule: Partial<RowLevelRecordsPermissions> & { ruleId: string },
): RowLevelRecordsPermissions => ({
  canCreateRecords: false,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  predicates: [],
  predicateGroups: [],
  unreadableFields: [],
  uneditableFields: [],
  ...rule,
});

const buildRole = (
  objects: RoleRecordsPermissions['objects'],
): RoleRecordsPermissions => ({ ...NO_ROLE_RECORDS_PERMISSIONS, objects });

describe('computePermissionUnion', () => {
  it('should return a single role unchanged', () => {
    const role = buildRole({ [OBJECT_ID]: NO_OBJECT_ACCESS });

    expect(computePermissionUnion([role])).toBe(role);
  });

  it('should grant an operation on all records when one role grants it', () => {
    const result = computePermissionUnion([
      buildRole({
        [OBJECT_ID]: { ...NO_OBJECT_ACCESS, canReadAllRecords: true },
      }),
      buildRole({
        [OBJECT_ID]: { ...NO_OBJECT_ACCESS, canUpdateAllRecords: true },
      }),
    ]);

    expect(result.objects[OBJECT_ID]).toEqual({
      ...NO_OBJECT_ACCESS,
      canReadAllRecords: true,
      canUpdateAllRecords: true,
    });
  });

  it('should keep the rules of every role, each with its own field lists', () => {
    const firstRule = buildReadRule({
      ruleId: 'rule-1',
      unreadableFields: ['text-field-id'],
    });
    const secondRule = buildReadRule({ ruleId: 'rule-2' });

    const result = computePermissionUnion([
      buildRole({
        [OBJECT_ID]: {
          ...NO_OBJECT_ACCESS,
          rowLevelRecordsPermissions: [firstRule],
        },
      }),
      buildRole({
        [OBJECT_ID]: {
          ...NO_OBJECT_ACCESS,
          rowLevelRecordsPermissions: [secondRule],
        },
      }),
    ]);

    expect(result.objects[OBJECT_ID]?.rowLevelRecordsPermissions).toEqual([
      firstRule,
      secondRule,
    ]);
  });

  it('should keep a field denied at object level by any role', () => {
    const result = computePermissionUnion([
      buildRole({
        [OBJECT_ID]: {
          ...NO_OBJECT_ACCESS,
          canReadAllRecords: true,
          unreadableFields: ['hidden-field-id'],
          uneditableFields: ['hidden-field-id'],
        },
      }),
      buildRole({
        [OBJECT_ID]: {
          ...NO_OBJECT_ACCESS,
          canReadAllRecords: true,
          uneditableFields: ['locked-field-id'],
        },
      }),
    ]);

    expect(result.objects[OBJECT_ID]?.unreadableFields).toEqual([
      'hidden-field-id',
    ]);
    expect(result.objects[OBJECT_ID]?.uneditableFields).toEqual([
      'hidden-field-id',
      'locked-field-id',
    ]);
  });
});
