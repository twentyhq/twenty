import { type ObjectsPermissions } from 'twenty-shared/types';

import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';

describe('computePermissionIntersection', () => {
  const objectMetadataId1 = 'object-1';
  const objectMetadataId2 = 'object-2';

  describe('edge cases', () => {
    it('should return empty object for empty array', () => {
      const result = computePermissionIntersection([]);

      expect(result).toEqual({});
    });

    it('should return same permissions for single role', () => {
      const permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const result = computePermissionIntersection([permissions]);

      expect(result).toEqual(permissions);
    });
  });

  describe('intersection logic (AND)', () => {
    it('should require ALL roles to have permission (true AND true = true)', () => {
      const role1Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const role2Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const result = computePermissionIntersection([
        role1Permissions,
        role2Permissions,
      ]);

      expect(result[objectMetadataId1]).toEqual({
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      });
    });

    it('should deny if ANY role lacks permission (true AND false = false)', () => {
      const role1Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const role2Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const result = computePermissionIntersection([
        role1Permissions,
        role2Permissions,
      ]);

      expect(result[objectMetadataId1]).toEqual({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: true,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      });
    });

    it('should deny all permissions if role lacks access to object entirely', () => {
      const role1Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const role2Permissions: ObjectsPermissions = {};

      const result = computePermissionIntersection([
        role1Permissions,
        role2Permissions,
      ]);

      expect(result[objectMetadataId1]).toEqual({
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      });
    });
  });

  describe('multiple objects', () => {
    it('should compute intersection independently for each object', () => {
      const role1Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
        [objectMetadataId2]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const role2Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
        [objectMetadataId2]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const result = computePermissionIntersection([
        role1Permissions,
        role2Permissions,
      ]);

      expect(result[objectMetadataId1]).toEqual({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      });

      expect(result[objectMetadataId2]).toEqual({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      });
    });
  });

  describe('restricted fields', () => {
    it('should compute intersection for restricted fields', () => {
      const role1Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {
            email: {
              canRead: null,
              canUpdate: false,
            },
            salary: {
              canRead: false,
              canUpdate: null,
            },
          },
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const role2Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {
            email: {
              canRead: null,
              canUpdate: null,
            },
            salary: {
              canRead: null,
              canUpdate: false,
            },
          },
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const result = computePermissionIntersection([
        role1Permissions,
        role2Permissions,
      ]);

      expect(result[objectMetadataId1].restrictedFields).toEqual({
        email: {
          canRead: null,
          canUpdate: false,
        },
        salary: {
          canRead: false,
          canUpdate: false,
        },
      });
    });

    it('should handle fields that only exist in some roles', () => {
      const role1Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {
            email: {
              canRead: false,
              canUpdate: false,
            },
          },
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const role2Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {
            salary: {
              canRead: false,
              canUpdate: false,
            },
          },
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const result = computePermissionIntersection([
        role1Permissions,
        role2Permissions,
      ]);

      expect(result[objectMetadataId1].restrictedFields).toEqual({
        email: {
          canRead: false,
          canUpdate: false,
        },
        salary: {
          canRead: false,
          canUpdate: false,
        },
      });
    });
  });

  describe('three or more roles', () => {
    it('should compute intersection across all roles', () => {
      const role1: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const role2: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const role3: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const result = computePermissionIntersection([role1, role2, role3]);

      expect(result[objectMetadataId1]).toEqual({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: true,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      });
    });
  });

  describe('row-level permission predicates', () => {
    const buildPermissions = (
      roleId: string,
      constrainedFieldMetadataIds: string[],
    ): ObjectsPermissions => ({
      [objectMetadataId1]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
        restrictedFields: {},
        rowLevelPermissionPredicates: constrainedFieldMetadataIds.map(
          (fieldMetadataId) =>
            ({
              id: `${roleId}-${fieldMetadataId}`,
              roleId,
              fieldMetadataId,
            }) as never,
        ),
        rowLevelPermissionPredicateGroups: [
          { id: `${roleId}-group`, roleId } as never,
        ],
      },
    });

    const constrainedFieldMetadataIdsOf = (permissions: ObjectsPermissions) =>
      permissions[objectMetadataId1].rowLevelPermissionPredicates.map(
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
        result[objectMetadataId1].rowLevelPermissionPredicateGroups,
      ).toEqual([]);
    });

    it('should leave a single role untouched', () => {
      const permissions = buildPermissions('user-role-id', ['field-1']);

      expect(computePermissionIntersection([permissions])).toBe(permissions);
    });
  });
});
