/* @license Enterprise */

import {
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { validateRLSPredicatesForRecords } from 'src/engine/twenty-orm/utils/validate-rls-predicates-for-records.util';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';

describe('validateRLSPredicatesForRecords - Non-editable Fields', () => {
  const createMockFlatObjectMetadata = (
    fieldIds: string[],
  ): FlatObjectMetadata => ({
    id: 'object-id-123',
    nameSingular: 'company',
    namePlural: 'companies',
    labelSingular: 'Company',
    labelPlural: 'Companies',
    icon: 'IconBuilding',
    color: null,
    targetTableName: 'company',
    isCustom: false,
    isRemote: false,
    isActive: true,
    isSystem: false,
    isAuditLogged: false,
    isSearchable: false,
    workspaceId: 'workspace-id-123',
    universalIdentifier: 'object-id-123',
    indexMetadataIds: [],
    objectPermissionIds: [],
    fieldPermissionIds: [],
    fieldIds,
    viewIds: [],
    applicationId: 'app-id-123',
    isLabelSyncedWithName: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcut: null,
    description: null,
    standardOverrides: null,
    isUIReadOnly: false,
    labelIdentifierFieldMetadataId: null,
    imageIdentifierFieldMetadataId: null,
    duplicateCriteria: null,
    applicationUniversalIdentifier: 'app-id-123',
    fieldUniversalIdentifiers: fieldIds,
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    labelIdentifierFieldMetadataUniversalIdentifier: null,
    imageIdentifierFieldMetadataUniversalIdentifier: null,
  });

  const createMockFlatFieldMetadata = (
    id: string,
    name: string,
    type: FieldMetadataType,
  ): FlatFieldMetadata =>
    ({
      id,
      name,
      type,
      label: name,
      objectMetadataId: 'object-id-123',
      isLabelSyncedWithName: true,
      isNullable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: id,
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      mainGroupByFieldMetadataViewIds: [],
      applicationId: null,
    }) as unknown as FlatFieldMetadata;

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byUniversalIdentifier: fields.reduce(
      (accumulator, field) => {
        accumulator[field.universalIdentifier] = field;
        return accumulator;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    universalIdentifierById: fields.reduce(
      (accumulator, field) => {
        accumulator[field.id] = field.universalIdentifier;
        return accumulator;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  const createMockRLSPredicateMaps = (): FlatRowLevelPermissionPredicateMaps => ({
    byUniversalIdentifier: {
      'rls-predicate-owner-empty': {
        id: 'rls-predicate-owner-empty',
        objectMetadataId: 'object-id-123',
        fieldMetadataId: 'owner-field-id',
        operand: 'is',
        value: null,
        roleId: 'role-id-123',
        deletedAt: null,
        rowLevelPermissionPredicateGroupId: 'rls-group-1',
        workspaceMemberFieldMetadataId: null,
        workspaceMemberSubFieldName: null,
        subFieldName: null,
        universalIdentifier: 'rls-predicate-owner-empty',
        applicationUniversalIdentifier: 'app-id-123',
        roleUniversalIdentifier: 'role-id-123',
        objectMetadataUniversalIdentifier: 'object-id-123',
        fieldMetadataUniversalIdentifier: 'owner-field-id',
        rowLevelPermissionPredicateGroupUniversalIdentifier: 'rls-group-1',
      },
    },
    universalIdentifierById: {
      'rls-predicate-owner-empty': 'rls-predicate-owner-empty',
    },
    universalIdentifiersByApplicationId: {},
  });

  const createMockRLSGroupMaps = (): FlatRowLevelPermissionPredicateGroupMaps => ({
    byUniversalIdentifier: {
      'rls-group-1': {
        id: 'rls-group-1',
        roleId: 'role-id-123',
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        parentRowLevelPermissionPredicateGroupId: null,
        deletedAt: null,
        universalIdentifier: 'rls-group-1',
        applicationUniversalIdentifier: 'app-id-123',
        roleUniversalIdentifier: 'role-id-123',
        parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
      },
    },
    universalIdentifierById: {
      'rls-group-1': 'rls-group-1',
    },
    universalIdentifiersByApplicationId: {},
  });

  const createMockWorkspaceInternalContext = (
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): WorkspaceInternalContext => ({
    workspaceId: 'workspace-id-123',
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps,
    flatIndexMaps: {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
    flatRowLevelPermissionPredicateMaps: createMockRLSPredicateMaps(),
    flatRowLevelPermissionPredicateGroupMaps: createMockRLSGroupMaps(),
    objectIdByNameSingular: {
      company: 'object-id-123',
    },
    featureFlagsMap: {},
    userWorkspaceRoleMap: {
      'user-id-123': 'role-id-123',
    },
    eventEmitterService: null as unknown as WorkspaceInternalContext['eventEmitterService'],
    coreDataSource: null as unknown as WorkspaceInternalContext['coreDataSource'],
  });

  const createMockUserAuthContext = (): WorkspaceAuthContext => ({
    userWorkspaceId: 'user-id-123',
    workspaceMember: {
      id: 'member-id-123',
      email: 'test@example.com',
    } as unknown as WorkspaceAuthContext['workspaceMember'],
  });

  describe('Issue #19201: Non-editable field with RLS permission blocking insertion', () => {
    it('should allow record creation when non-editable field has default value matching RLS "is empty" permission', () => {
      const ownerField = createMockFlatFieldMetadata(
        'owner-field-id',
        'owner',
        FieldMetadataType.UUID,
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([ownerField]);
      const objectMetadata = createMockFlatObjectMetadata(['owner-field-id']);

      // Object permissions: owner field is NOT editable for the role (canUpdate = false)
      const objectRecordsPermissions: ObjectsPermissions = {
        'object-id-123': {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {
            'owner-field-id': {
              canRead: true,
              canUpdate: false, // Non-editable field
            },
          },
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const internalContext = createMockWorkspaceInternalContext(flatFieldMetadataMaps);
      const authContext = createMockUserAuthContext();

      // Record being created with owner field empty (null)
      // This should NOT throw because during INSERT with a non-editable field,
      // we skip the RLS validation for that field
      const record = {
        id: 'record-id-123',
        owner: null, // Empty, which matches "Owner is Empty" permission
      };

      expect(() => {
        validateRLSPredicatesForRecords({
          records: [record],
          objectMetadata,
          internalContext,
          authContext,
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions,
          isInsertOperation: true, // Key: this is an INSERT operation
        });
      }).not.toThrow();
    });

    it('should enforce RLS on editable fields even during INSERT', () => {
      const ownerField = createMockFlatFieldMetadata(
        'owner-field-id',
        'owner',
        FieldMetadataType.UUID,
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([ownerField]);
      const objectMetadata = createMockFlatObjectMetadata(['owner-field-id']);

      // Object permissions: owner field IS editable for the role (canUpdate is not false)
      const objectRecordsPermissions: ObjectsPermissions = {
        'object-id-123': {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {}, // No restrictions = field is fully editable
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const internalContext = createMockWorkspaceInternalContext(flatFieldMetadataMaps);
      const authContext = createMockUserAuthContext();

      // Record with owner field that does NOT match permission (not empty, and not the current user)
      const record = {
        id: 'record-id-123',
        owner: 'someone-else-id',
      };

      expect(() => {
        validateRLSPredicatesForRecords({
          records: [record],
          objectMetadata,
          internalContext,
          authContext,
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions,
          isInsertOperation: true,
        });
      }).toThrow(TwentyORMException); // Should throw because field is editable and doesn't match permission
    });

    it('should NOT skip validation for non-editable fields during UPDATE operations', () => {
      const ownerField = createMockFlatFieldMetadata(
        'owner-field-id',
        'owner',
        FieldMetadataType.UUID,
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([ownerField]);
      const objectMetadata = createMockFlatObjectMetadata(['owner-field-id']);

      // Object permissions: owner field is NOT editable
      const objectRecordsPermissions: ObjectsPermissions = {
        'object-id-123': {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {
            'owner-field-id': {
              canRead: true,
              canUpdate: false, // Non-editable field
            },
          },
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      };

      const internalContext = createMockWorkspaceInternalContext(flatFieldMetadataMaps);
      const authContext = createMockUserAuthContext();

      const record = {
        id: 'record-id-123',
        owner: null,
      };

      expect(() => {
        validateRLSPredicatesForRecords({
          records: [record],
          objectMetadata,
          internalContext,
          authContext,
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions,
          isInsertOperation: false, // UPDATE operation - should NOT skip validation
        });
      }).toThrow(TwentyORMException); // Should throw because isInsertOperation=false
    });
  });
});
