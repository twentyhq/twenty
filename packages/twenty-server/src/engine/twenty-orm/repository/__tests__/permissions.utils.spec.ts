import {
  type ObjectPermissions,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  type OperationType,
  validateOperationIsPermittedOrThrow,
} from 'src/engine/twenty-orm/repository/permissions.utils';

describe('validateOperationIsPermittedOrThrow - system objects permissions', () => {
  const SYSTEM_OBJECT_ID = 'system-obj-message-id';
  const SYSTEM_OBJECT_NAME = 'message';
  const SYSTEM_OBJECT_UNIVERSAL_ID = 'message-universal-id';

  const mockFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
    byUniversalIdentifier: {
      [SYSTEM_OBJECT_UNIVERSAL_ID]: {
        id: SYSTEM_OBJECT_ID,
        nameSingular: SYSTEM_OBJECT_NAME,
        universalIdentifier: SYSTEM_OBJECT_UNIVERSAL_ID,
        isSystem: true,
        isCustom: false,
        fieldIds: [],
        indexIds: [],
      } as unknown as FlatObjectMetadata,
    },
    universalIdentifierById: {
      [SYSTEM_OBJECT_ID]: SYSTEM_OBJECT_UNIVERSAL_ID,
    },
    universalIdentifiersByApplicationId: {},
  };

  const mockFlatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata> = {
    byUniversalIdentifier: {},
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  };

  const objectIdByNameSingular: Record<string, string> = {
    [SYSTEM_OBJECT_NAME]: SYSTEM_OBJECT_ID,
  };

  const baseObjectPermissions: ObjectPermissions = {
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  };

  const executeValidation = ({
    operationType,
    objectsPermissions = {},
    updatedColumns = [],
    selectedColumns = [],
  }: {
    operationType: OperationType;
    objectsPermissions?: ObjectsPermissions;
    updatedColumns?: string[];
    selectedColumns?: string[] | '*';
  }) => {
    return validateOperationIsPermittedOrThrow({
      entityName: SYSTEM_OBJECT_NAME,
      operationType,
      objectsPermissions,
      flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
      flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
      objectIdByNameSingular,
      selectedColumns,
      allFieldsSelected: false,
      updatedColumns,
    });
  };

  describe('when no explicit role permissions are defined for the system object', () => {
    it('should allow insert, update, delete without throwing for backward compatibility', () => {
      expect(() =>
        executeValidation({ operationType: 'insert' }),
      ).not.toThrow();
      expect(() =>
        executeValidation({ operationType: 'update' }),
      ).not.toThrow();
      expect(() =>
        executeValidation({ operationType: 'delete' }),
      ).not.toThrow();
      expect(() =>
        executeValidation({ operationType: 'soft-delete' }),
      ).not.toThrow();
    });
  });

  describe('when object-level role permissions are defined for the system object', () => {
    it('should throw PERMISSION_DENIED on insert when canUpdateObjectRecords is false', () => {
      const objectsPermissions: ObjectsPermissions = {
        [SYSTEM_OBJECT_ID]: {
          ...baseObjectPermissions,
          canUpdateObjectRecords: false,
        },
      };

      expect(() =>
        executeValidation({ operationType: 'insert', objectsPermissions }),
      ).toThrow(
        new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        ),
      );
    });

    it('should throw PERMISSION_DENIED on update when canUpdateObjectRecords is false', () => {
      const objectsPermissions: ObjectsPermissions = {
        [SYSTEM_OBJECT_ID]: {
          ...baseObjectPermissions,
          canUpdateObjectRecords: false,
        },
      };

      expect(() =>
        executeValidation({ operationType: 'update', objectsPermissions }),
      ).toThrow(
        new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        ),
      );
    });

    it('should throw PERMISSION_DENIED on delete when canDestroyObjectRecords is false', () => {
      const objectsPermissions: ObjectsPermissions = {
        [SYSTEM_OBJECT_ID]: {
          ...baseObjectPermissions,
          canDestroyObjectRecords: false,
        },
      };

      expect(() =>
        executeValidation({ operationType: 'delete', objectsPermissions }),
      ).toThrow(
        new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        ),
      );
    });

    it('should throw PERMISSION_DENIED on soft-delete when canSoftDeleteObjectRecords is false', () => {
      const objectsPermissions: ObjectsPermissions = {
        [SYSTEM_OBJECT_ID]: {
          ...baseObjectPermissions,
          canSoftDeleteObjectRecords: false,
        },
      };

      expect(() =>
        executeValidation({ operationType: 'soft-delete', objectsPermissions }),
      ).toThrow(
        new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        ),
      );
    });

    it('should throw PERMISSION_DENIED on select when canReadObjectRecords is false', () => {
      const objectsPermissions: ObjectsPermissions = {
        [SYSTEM_OBJECT_ID]: {
          ...baseObjectPermissions,
          canReadObjectRecords: false,
        },
      };

      expect(() =>
        executeValidation({ operationType: 'select', objectsPermissions }),
      ).toThrow(
        new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        ),
      );
    });

    it('should permit operations when role permissions grant access to the system object', () => {
      const objectsPermissions: ObjectsPermissions = {
        [SYSTEM_OBJECT_ID]: {
          ...baseObjectPermissions,
          canUpdateObjectRecords: true,
          canDestroyObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canReadObjectRecords: true,
        },
      };

      expect(() =>
        executeValidation({ operationType: 'insert', objectsPermissions }),
      ).not.toThrow();
      expect(() =>
        executeValidation({ operationType: 'update', objectsPermissions }),
      ).not.toThrow();
      expect(() =>
        executeValidation({ operationType: 'delete', objectsPermissions }),
      ).not.toThrow();
      expect(() =>
        executeValidation({ operationType: 'soft-delete', objectsPermissions }),
      ).not.toThrow();
      expect(() =>
        executeValidation({ operationType: 'select', objectsPermissions }),
      ).not.toThrow();
    });
  });
});
