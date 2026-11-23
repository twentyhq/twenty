import {
  type ObjectRecordsPermissions,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelRecordsPermissions,
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

  describe('row-level permission rules', () => {
    const NO_GRANT: AllRecordsGrants = {
      canRead: false,
      canUpdate: false,
      canSoftDelete: false,
      canDestroy: false,
    };

    const buildRule = ({
      roleId,
      constrainedFieldMetadataIds,
      grants,
    }: {
      roleId: string;
      constrainedFieldMetadataIds: string[];
      grants: AllRecordsGrants;
    }): RowLevelRecordsPermissions => ({
      ruleId: `${roleId}-rule`,
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
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          parentRowLevelPermissionPredicateGroupId: null,
          positionInRowLevelPermissionPredicateGroup: null,
          canReadRecords: false,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
        },
      ],
      unreadableFields: [],
      uneditableFields: [],
    });

    const buildPermissions = ({
      roleId,
      constrainedFieldMetadataIds = [],
      allRecordsGrants = NO_GRANT,
      ruleGrants = ALL_GRANTED,
    }: {
      roleId: string;
      constrainedFieldMetadataIds?: string[];
      allRecordsGrants?: AllRecordsGrants;
      ruleGrants?: AllRecordsGrants;
    }): RoleRecordsPermissions =>
      buildRoleRecordsPermissions({
        [objectMetadataId1]:
          constrainedFieldMetadataIds.length === 0
            ? buildAllRecordsPermissions(allRecordsGrants)
            : {
                ...buildAllRecordsPermissions(allRecordsGrants),
                rowLevelRecordsPermissions: [
                  buildRule({
                    roleId,
                    constrainedFieldMetadataIds,
                    grants: ruleGrants,
                  }),
                ],
              },
      });

    const findRules = (permissions: RoleRecordsPermissions) =>
      permissions.objects[objectMetadataId1]?.rowLevelRecordsPermissions ?? [];

    it('should keep the rules of every role without intersecting their predicates', () => {
      const result = computePermissionIntersection([
        buildPermissions({
          roleId: 'user-role-id',
          constrainedFieldMetadataIds: ['field-1', 'field-2'],
        }),
        buildPermissions({
          roleId: 'application-role-id',
          constrainedFieldMetadataIds: ['field-1'],
        }),
      ]);

      expect(
        findRules(result).map(({ ruleId, predicates }) => [
          ruleId,
          predicates.map(({ fieldMetadataId }) => fieldMetadataId),
        ]),
      ).toEqual([
        ['user-role-id-rule', ['field-1', 'field-2']],
        ['application-role-id-rule', ['field-1']],
      ]);
    });

    it('should not reach records through a rule when another role is restricted too', () => {
      const result = computePermissionIntersection([
        buildPermissions({
          roleId: 'user-role-id',
          constrainedFieldMetadataIds: ['field-1'],
        }),
        buildPermissions({
          roleId: 'application-role-id',
          constrainedFieldMetadataIds: ['field-1'],
        }),
      ]);

      expect(findRules(result)).toHaveLength(2);
      findRules(result).forEach((rule) =>
        expect(rule).toMatchObject({
          canCreateRecords: false,
          canReadRecords: false,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
        }),
      );
    });

    it('should keep the all records grants that every role holds next to the rules', () => {
      const result = computePermissionIntersection([
        buildPermissions({
          roleId: 'user-role-id',
          constrainedFieldMetadataIds: ['field-1'],
          allRecordsGrants: { ...NO_GRANT, canRead: true },
        }),
        buildPermissions({
          roleId: 'application-role-id',
          allRecordsGrants: ALL_GRANTED,
        }),
      ]);

      expect(result.objects[objectMetadataId1]?.canReadAllRecords).toBe(true);
      expect(result.objects[objectMetadataId1]?.canUpdateAllRecords).toBe(
        false,
      );
      expect(findRules(result)).toEqual([
        buildRule({
          roleId: 'user-role-id',
          constrainedFieldMetadataIds: ['field-1'],
          grants: ALL_GRANTED,
        }),
      ]);
    });

    it('should reach records through a rule only for operations every other role reaches on all records', () => {
      const result = computePermissionIntersection([
        buildPermissions({
          roleId: 'user-role-id',
          constrainedFieldMetadataIds: ['field-1'],
        }),
        buildPermissions({
          roleId: 'application-role-id',
          allRecordsGrants: { ...ALL_GRANTED, canDestroy: false },
        }),
      ]);

      expect(result.objects[objectMetadataId1]).toEqual({
        ...buildAllRecordsPermissions(NO_GRANT),
        rowLevelRecordsPermissions: [
          {
            ...buildRule({
              roleId: 'user-role-id',
              constrainedFieldMetadataIds: ['field-1'],
              grants: ALL_GRANTED,
            }),
            canDestroyRecords: false,
          },
        ],
      });
    });

    it.each([
      ['canRead', 'canReadRecords'],
      ['canUpdate', 'canUpdateRecords'],
      ['canSoftDelete', 'canSoftDeleteRecords'],
      ['canDestroy', 'canDestroyRecords'],
    ] as const)(
      'should not reach records through a rule when another role denies %s',
      (deniedGrant, rowLevelGrant) => {
        const result = computePermissionIntersection([
          buildPermissions({
            roleId: 'user-role-id',
            constrainedFieldMetadataIds: ['field-1'],
          }),
          buildPermissions({
            roleId: 'application-role-id',
            allRecordsGrants: { ...ALL_GRANTED, [deniedGrant]: false },
          }),
        ]);

        expect(findRules(result)[0]).toMatchObject({
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
      const permissions = buildPermissions({
        roleId: 'user-role-id',
        constrainedFieldMetadataIds: ['field-1'],
      });

      expect(computePermissionIntersection([permissions])).toBe(permissions);
    });
  });
});
