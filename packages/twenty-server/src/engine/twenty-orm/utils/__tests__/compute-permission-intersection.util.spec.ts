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
        },
      };

      const role2Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
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
        },
      };

      const role2Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: true,
          restrictedFields: {},
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
        },
        [objectMetadataId2]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
        },
      };

      const role2Permissions: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: false,
          restrictedFields: {},
        },
        [objectMetadataId2]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
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
      });

      expect(result[objectMetadataId2]).toEqual({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
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
        },
      };

      const role2: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: true,
          restrictedFields: {},
        },
      };

      const role3: ObjectsPermissions = {
        [objectMetadataId1]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
        },
      };

      const result = computePermissionIntersection([role1, role2, role3]);

      expect(result[objectMetadataId1]).toEqual({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: true,
        restrictedFields: {},
      });
    });
  });
});
