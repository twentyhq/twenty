import {
  type ObjectRecordsPermissions,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { computePermissionIntersection } from 'src/engine/permissions/internal/role/utils/compute-permission-intersection.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

type AllRecordsGrants = {
  canRead: boolean;
  canUpdate: boolean;
  canSoftDelete: boolean;
  canDestroy: boolean;
};

const ALL_GRANTED: AllRecordsGrants = {
  canRead: true,
  canUpdate: true,
  canSoftDelete: true,
  canDestroy: true,
};

const buildAllRecordsPermissions = ({
  unreadableFields = [],
  uneditableFields = [],
  ...grants
}: AllRecordsGrants &
  Partial<
    Pick<ObjectRecordsPermissions, 'unreadableFields' | 'uneditableFields'>
  >): ObjectRecordsPermissions => ({
  canCreateAllRecords: grants.canUpdate,
  canReadAllRecords: grants.canRead,
  canUpdateAllRecords: grants.canUpdate,
  canSoftDeleteAllRecords: grants.canSoftDelete,
  canDestroyAllRecords: grants.canDestroy,
  unreadableFields,
  uneditableFields,
});

const buildRoleRecordsPermissions = (
  objects: RoleRecordsPermissions['objects'],
): RoleRecordsPermissions => ({
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  objects,
});

describe('computePermissionIntersection', () => {
  const objectMetadataId1 = 'object-1';
  const objectMetadataId2 = 'object-2';

  describe('create permission', () => {
    const buildRole = (
      objectRecordsPermissions: Partial<ObjectRecordsPermissions>,
    ) =>
      buildRoleRecordsPermissions({
        [objectMetadataId1]: {
          ...buildAllRecordsPermissions(ALL_GRANTED),
          ...objectRecordsPermissions,
        },
      });

    it('should deny when one role denies it', () => {
      const result = computePermissionIntersection([
        buildRole({ canCreateAllRecords: true }),
        buildRole({ canCreateAllRecords: false }),
      ]);

      expect(result.objects[objectMetadataId1]?.canCreateAllRecords).toBe(
        false,
      );
    });
  });

  describe('edge cases', () => {
    it('should return no permissions for empty array', () => {
      const result = computePermissionIntersection([]);

      expect(result).toEqual(NO_ROLE_RECORDS_PERMISSIONS);
    });

    it('should return same permissions for single role', () => {
      const permissions = buildRoleRecordsPermissions({
        [objectMetadataId1]: buildAllRecordsPermissions({
          canRead: true,
          canUpdate: true,
          canSoftDelete: false,
          canDestroy: false,
        }),
      });

      const result = computePermissionIntersection([permissions]);

      expect(result).toEqual(permissions);
    });
  });

  describe('intersection logic (AND)', () => {
    it('should require ALL roles to have permission (true AND true = true)', () => {
      const result = computePermissionIntersection([
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions(ALL_GRANTED),
        }),
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions(ALL_GRANTED),
        }),
      ]);

      expect(result.objects[objectMetadataId1]).toEqual(
        buildAllRecordsPermissions(ALL_GRANTED),
      );
    });

    it('should deny if ANY role lacks permission (true AND false = false)', () => {
      const result = computePermissionIntersection([
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions(ALL_GRANTED),
        }),
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            canRead: true,
            canUpdate: false,
            canSoftDelete: false,
            canDestroy: true,
          }),
        }),
      ]);

      expect(result.objects[objectMetadataId1]).toEqual(
        buildAllRecordsPermissions({
          canRead: true,
          canUpdate: false,
          canSoftDelete: false,
          canDestroy: true,
        }),
      );
    });

    it('should deny all permissions if role lacks access to object entirely', () => {
      const result = computePermissionIntersection([
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions(ALL_GRANTED),
        }),
        buildRoleRecordsPermissions({}),
      ]);

      expect(result.objects[objectMetadataId1]).toEqual(
        buildAllRecordsPermissions({
          canRead: false,
          canUpdate: false,
          canSoftDelete: false,
          canDestroy: false,
        }),
      );
    });

    it.each([
      'canReadAllRecords',
      'canUpdateAllRecords',
      'canSoftDeleteAllRecords',
      'canDestroyAllRecords',
    ] as const)(
      'should require ALL roles to grant the role-level %s',
      (roleLevelGrant) => {
        const result = computePermissionIntersection([
          buildRoleRecordsPermissions({}),
          { ...buildRoleRecordsPermissions({}), [roleLevelGrant]: false },
        ]);

        expect(result).toEqual({
          ...buildRoleRecordsPermissions({}),
          [roleLevelGrant]: false,
        });
      },
    );
  });

  describe('multiple objects', () => {
    it('should compute intersection independently for each object', () => {
      const result = computePermissionIntersection([
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            canRead: true,
            canUpdate: true,
            canSoftDelete: false,
            canDestroy: false,
          }),
          [objectMetadataId2]: buildAllRecordsPermissions({
            canRead: true,
            canUpdate: false,
            canSoftDelete: false,
            canDestroy: false,
          }),
        }),
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            canRead: true,
            canUpdate: false,
            canSoftDelete: true,
            canDestroy: false,
          }),
          [objectMetadataId2]: buildAllRecordsPermissions({
            canRead: true,
            canUpdate: true,
            canSoftDelete: false,
            canDestroy: false,
          }),
        }),
      ]);

      expect(result.objects[objectMetadataId1]).toEqual(
        buildAllRecordsPermissions({
          canRead: true,
          canUpdate: false,
          canSoftDelete: false,
          canDestroy: false,
        }),
      );

      expect(result.objects[objectMetadataId2]).toEqual(
        buildAllRecordsPermissions({
          canRead: true,
          canUpdate: false,
          canSoftDelete: false,
          canDestroy: false,
        }),
      );
    });
  });

  describe('unreadable and uneditable fields', () => {
    it('should add up the field lists of every role', () => {
      const result = computePermissionIntersection([
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            ...ALL_GRANTED,
            unreadableFields: ['salary'],
            uneditableFields: ['email', 'salary'],
          }),
        }),
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            ...ALL_GRANTED,
            unreadableFields: [],
            uneditableFields: ['salary'],
          }),
        }),
      ]);

      expect(result.objects[objectMetadataId1]?.unreadableFields).toEqual([
        'salary',
      ]);
      expect(
        new Set(result.objects[objectMetadataId1]?.uneditableFields),
      ).toEqual(new Set(['email', 'salary']));
    });

    it('should handle fields that only exist in some roles', () => {
      const result = computePermissionIntersection([
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            ...ALL_GRANTED,
            unreadableFields: ['email'],
            uneditableFields: ['email'],
          }),
        }),
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            ...ALL_GRANTED,
            unreadableFields: ['salary'],
            uneditableFields: ['salary'],
          }),
        }),
      ]);

      expect(
        new Set(result.objects[objectMetadataId1]?.unreadableFields),
      ).toEqual(new Set(['email', 'salary']));
    });
  });

  describe('three or more roles', () => {
    it('should compute intersection across all roles', () => {
      const result = computePermissionIntersection([
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions(ALL_GRANTED),
        }),
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            ...ALL_GRANTED,
            canSoftDelete: false,
          }),
        }),
        buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions({
            ...ALL_GRANTED,
            canUpdate: false,
          }),
        }),
      ]);

      expect(result.objects[objectMetadataId1]).toEqual(
        buildAllRecordsPermissions({
          canRead: true,
          canUpdate: false,
          canSoftDelete: false,
          canDestroy: true,
        }),
      );
    });
  });

  describe('row-level permission predicates', () => {
    const buildPermissions = (
      roleId: string,
      constrainedFieldMetadataIds: string[],
      grants: AllRecordsGrants = ALL_GRANTED,
    ): RoleRecordsPermissions => {
      if (constrainedFieldMetadataIds.length === 0) {
        return buildRoleRecordsPermissions({
          [objectMetadataId1]: buildAllRecordsPermissions(grants),
        });
      }

      return buildRoleRecordsPermissions({
        [objectMetadataId1]: {
          ...buildAllRecordsPermissions({
            canRead: false,
            canUpdate: false,
            canSoftDelete: false,
            canDestroy: false,
          }),
          rowLevelRecordsPermissions: {
            canCreateRecords: grants.canUpdate,
            canReadRecords: grants.canRead,
            canUpdateRecords: grants.canUpdate,
            canSoftDeleteRecords: grants.canSoftDelete,
            canDestroyRecords: grants.canDestroy,
            predicates: constrainedFieldMetadataIds.map((fieldMetadataId) => ({
              id: `${roleId}-${fieldMetadataId}`,
              roleId,
              objectMetadataId: objectMetadataId1,
              fieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.IS,
              value: null,
              subFieldName: null,
              rowLevelPermissionPredicateGroupId: null,
              workspaceMemberFieldMetadataId: null,
              workspaceMemberSubFieldName: null,
            })),
            predicateGroups: [
              {
                id: `${roleId}-group`,
                roleId,
                objectMetadataId: objectMetadataId1,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                parentRowLevelPermissionPredicateGroupId: null,
                positionInRowLevelPermissionPredicateGroup: null,
                canReadRecords: false,
                canUpdateRecords: false,
                canSoftDeleteRecords: false,
                canDestroyRecords: false,
              },
            ],
          },
        },
      });
    };

    const constrainedFieldMetadataIdsOf = (
      permissions: RoleRecordsPermissions,
    ) =>
      permissions.objects[
        objectMetadataId1
      ]?.rowLevelRecordsPermissions?.predicates.map(
        (predicate) => predicate.fieldMetadataId,
      );

    it('should keep a field every role constrains', () => {
      const result = computePermissionIntersection([
        buildPermissions('user-role-id', ['field-1']),
        buildPermissions('application-role-id', ['field-1']),
      ]);

      expect(constrainedFieldMetadataIdsOf(result)).toEqual(['field-1']);
    });

    it('should drop a field only one role constrains', () => {
      const result = computePermissionIntersection([
        buildPermissions('user-role-id', ['field-1', 'field-2']),
        buildPermissions('application-role-id', ['field-1']),
      ]);

      expect(constrainedFieldMetadataIdsOf(result)).toEqual(['field-1']);
    });

    it('should drop every field when a role constrains none', () => {
      const result = computePermissionIntersection([
        buildPermissions('user-role-id', ['field-1']),
        buildPermissions('application-role-id', []),
      ]);

      expect(constrainedFieldMetadataIdsOf(result)).toEqual([]);
    });

    it('should not expose a combined predicate group tree', () => {
      const result = computePermissionIntersection([
        buildPermissions('user-role-id', ['field-1']),
        buildPermissions('application-role-id', ['field-1']),
      ]);

      expect(
        result.objects[objectMetadataId1]?.rowLevelRecordsPermissions
          ?.predicateGroups,
      ).toEqual([]);
    });

    it('should reach records through row-level permissions only when every role reaches some', () => {
      const result = computePermissionIntersection([
        buildPermissions('user-role-id', ['field-1']),
        buildPermissions('application-role-id', [], {
          ...ALL_GRANTED,
          canDestroy: false,
        }),
      ]);

      expect(result.objects[objectMetadataId1]).toEqual({
        ...buildAllRecordsPermissions({
          canRead: false,
          canUpdate: false,
          canSoftDelete: false,
          canDestroy: false,
        }),
        rowLevelRecordsPermissions: {
          canCreateRecords: true,
          canReadRecords: true,
          canUpdateRecords: true,
          canSoftDeleteRecords: true,
          canDestroyRecords: false,
          predicates: [],
          predicateGroups: [],
        },
      });
    });

    it.each([
      ['canRead', 'canReadRecords'],
      ['canUpdate', 'canUpdateRecords'],
      ['canSoftDelete', 'canSoftDeleteRecords'],
      ['canDestroy', 'canDestroyRecords'],
    ] as const)(
      'should not reach records through row-level permissions when another role denies %s',
      (deniedGrant, rowLevelGrant) => {
        const result = computePermissionIntersection([
          buildPermissions('user-role-id', ['field-1']),
          buildPermissions('application-role-id', [], {
            ...ALL_GRANTED,
            [deniedGrant]: false,
          }),
        ]);

        expect(
          result.objects[objectMetadataId1]?.rowLevelRecordsPermissions,
        ).toMatchObject({
          canCreateRecords: deniedGrant !== 'canUpdate',
          canReadRecords: deniedGrant !== 'canRead',
          canUpdateRecords: deniedGrant !== 'canUpdate',
          canSoftDeleteRecords: deniedGrant !== 'canSoftDelete',
          canDestroyRecords: deniedGrant !== 'canDestroy',
          [rowLevelGrant]: false,
        });
      },
    );

    it('should leave a single role untouched', () => {
      const permissions = buildPermissions('user-role-id', ['field-1']);

      expect(computePermissionIntersection([permissions])).toBe(permissions);
    });
  });
});
