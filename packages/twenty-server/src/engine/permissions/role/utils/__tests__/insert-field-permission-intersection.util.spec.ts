import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computePrincipalsRecordsPermissions } from 'src/engine/permissions/role/utils/compute-principals-records-permissions.util';
import { validateOperationIsPermittedOrThrow } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_METADATA_ID = 'opportunity-id';
const REGION_FIELD_METADATA_ID = 'region-id';
const RESTRICTED_ROLE_ID = 'restricted-role';
const OTHER_ROLE_ID = 'other-role';
const ALL_RECORDS_GRANTS = {
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
};
const FULL_ACCESS: ObjectRecordsPermissions = {
  ...ALL_RECORDS_GRANTS,
  restrictedFields: {},
};
const REGION_WRITE_DENIED = {
  [REGION_FIELD_METADATA_ID]: { canRead: null, canUpdate: false },
};

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

flatObjectMetadataMaps.byUniversalIdentifier.opportunity =
  getFlatObjectMetadataMock({
    id: OBJECT_METADATA_ID,
    universalIdentifier: 'opportunity',
    nameSingular: 'opportunity',
    fieldIds: [REGION_FIELD_METADATA_ID],
  });
flatObjectMetadataMaps.universalIdentifierById[OBJECT_METADATA_ID] =
  'opportunity';

const flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata> =
  createEmptyFlatEntityMaps();

flatFieldMetadataMaps.byUniversalIdentifier.region = getFlatFieldMetadataMock({
  id: REGION_FIELD_METADATA_ID,
  universalIdentifier: 'region',
  objectMetadataId: OBJECT_METADATA_ID,
  name: 'region',
  type: FieldMetadataType.TEXT,
});
flatFieldMetadataMaps.universalIdentifierById[REGION_FIELD_METADATA_ID] =
  'region';

const buildRolePermissions = (
  objectPermissions: ObjectRecordsPermissions,
): RoleRecordsPermissions => ({
  ...ALL_RECORDS_GRANTS,
  objects: { [OBJECT_METADATA_ID]: objectPermissions },
});

const restrictedRolePermissions = buildRolePermissions({
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  restrictedFields: REGION_WRITE_DENIED,
  rowLevelRecordsPermissions: {
    canReadRecords: true,
    canUpdateRecords: true,
    canSoftDeleteRecords: false,
    canDestroyRecords: false,
    predicates: [
      {
        id: 'region-predicate',
        roleId: RESTRICTED_ROLE_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        fieldMetadataId: REGION_FIELD_METADATA_ID,
        operand: RowLevelPermissionPredicateOperand.IS,
        value: 'EU',
        subFieldName: null,
        rowLevelPermissionPredicateGroupId: null,
        workspaceMemberFieldMetadataId: null,
        workspaceMemberSubFieldName: null,
      },
    ],
    predicateGroups: [],
  },
});

const validateRegionWrite = ({
  mainRoleId = RESTRICTED_ROLE_ID,
  otherRolePermissions = FULL_ACCESS,
  scopePermissions,
  operationType = 'insert',
}: {
  mainRoleId?: typeof RESTRICTED_ROLE_ID | typeof OTHER_ROLE_ID;
  otherRolePermissions?: ObjectRecordsPermissions;
  scopePermissions?: ObjectRecordsPermissions;
  operationType?: 'insert' | 'update';
} = {}) => {
  const recordsPermissions = computePrincipalsRecordsPermissions({
    principals: {
      mainPrincipal: { type: 'role', roleId: mainRoleId },
      limitingPrincipal: {
        type: 'agent',
        agentId: 'agent-id',
        roleId:
          mainRoleId === RESTRICTED_ROLE_ID
            ? OTHER_ROLE_ID
            : RESTRICTED_ROLE_ID,
      },
      applicationPrincipal: { type: 'customApplication' },
      ...(scopePermissions && {
        aiRunScope: {
          recordsPermissions: buildRolePermissions(scopePermissions),
          permissionFlags: {},
        },
      }),
    },
    rolesPermissions: {
      [RESTRICTED_ROLE_ID]: restrictedRolePermissions,
      [OTHER_ROLE_ID]: buildRolePermissions(otherRolePermissions),
    },
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatApplicationMaps: { byId: {} },
  });

  validateOperationIsPermittedOrThrow({
    entityName: 'opportunity',
    operationType,
    recordsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular: { opportunity: OBJECT_METADATA_ID },
    selectedColumns: [],
    updatedColumns: ['region'],
  });
};

describe('insert field permissions across roles', () => {
  it.each([RESTRICTED_ROLE_ID, OTHER_ROLE_ID] as const)(
    'exempts the insert field check when the other role permits the field without a predicate (%s as main role)',
    (mainRoleId) => {
      expect(() => validateRegionWrite({ mainRoleId })).not.toThrow();
    },
  );

  it('does not let one role exempt a field another role denies', () => {
    expect(() =>
      validateRegionWrite({
        otherRolePermissions: {
          ...FULL_ACCESS,
          restrictedFields: REGION_WRITE_DENIED,
        },
      }),
    ).toThrow('no permission to write field "region"');
  });

  it('preserves the insert exemption under an unrestricted AI run scope', () => {
    expect(() =>
      validateRegionWrite({ scopePermissions: FULL_ACCESS }),
    ).not.toThrow();
  });

  it('does not exempt a field denied by the AI run scope', () => {
    expect(() =>
      validateRegionWrite({
        scopePermissions: {
          ...FULL_ACCESS,
          restrictedFields: REGION_WRITE_DENIED,
        },
      }),
    ).toThrow('no permission to write field "region"');
  });

  it('does not apply an insert exemption to an update', () => {
    expect(() => validateRegionWrite({ operationType: 'update' })).toThrow(
      'no permission to write field "region"',
    );
  });
});
