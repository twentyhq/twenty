import {
  FieldMetadataType,
  type ObjectPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/permissions/role/utils/get-objects-permissions-from-role-permission-config.util';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

const OBJECT_ID = 'object-1';

const EMPTY_FLAT_OBJECT_METADATA_MAPS: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();
const EMPTY_FLAT_FIELD_METADATA_MAPS: FlatEntityMaps<OrmFlatFieldMetadata> =
  createEmptyFlatEntityMaps();
const EMPTY_APPLICATION_DEFAULT_ROLE_MAPS: ApplicationDefaultRoleMaps = {
  byId: {},
};

const agentRolePermissions = {
  [OBJECT_ID]: {
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
};

const defaultRolePermissions = {
  [OBJECT_ID]: {
    canReadObjectRecords: false,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
};

const rolesPermissions: ObjectsPermissionsByRoleId = {
  'agent-role-id': agentRolePermissions,
  'default-role-id': defaultRolePermissions,
};

describe('getObjectsPermissionsFromRolePermissionConfig', () => {
  it('should resolve a single role unchanged', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: undefined,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: { agentRoleId: 'agent-role-id' },
        },
      }),
    ).toBe(agentRolePermissions);
  });

  it('should resolve a role held by several sources as that role alone', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: undefined,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            userWorkspaceRoleId: 'default-role-id',
            applicationRoleId: 'default-role-id',
          },
        },
      }),
    ).toBe(defaultRolePermissions);
  });

  it('should intersect every role when several are provided', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: undefined,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            agentRoleId: 'agent-role-id',
            userWorkspaceRoleId: 'default-role-id',
          },
        },
      }),
    ).toEqual(defaultRolePermissions);
  });

  it('should not grant a permission that only one of the roles allows', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: undefined,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            userWorkspaceRoleId: 'default-role-id',
            applicationRoleId: 'agent-role-id',
          },
        },
      })[OBJECT_ID].canReadObjectRecords,
    ).toBe(false);
  });

  it('should deny when one of the intersected roles is missing from the cache', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: undefined,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            agentRoleId: 'agent-role-id',
            applicationRoleId: 'missing-role-id',
          },
        },
      }),
    ).toEqual({});
  });

  it('should return empty permissions when bypassing checks', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: undefined,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
      }),
    ).toEqual({});
  });

  it('should return empty permissions when the role is missing from the cache', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: undefined,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: { apiKeyRoleId: 'missing-role-id' },
        },
      }),
    ).toEqual({});
  });

  it('should deny when the main principal has no role', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: {
          workspaceId: 'workspace-1',
          mainPrincipal: { workspaceMemberId: 'member-id' },
          applicationPrincipal: { isCustomApp: true },
        },
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            agentRoleId: 'agent-role-id',
            userWorkspaceRoleId: null,
          },
        },
      }),
    ).toEqual({});
  });

  it('should deny when no actor restricts the call', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        principals: undefined,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: { intersectionOf: {} },
      }),
    ).toEqual({});
  });
});

const INVOICE_ID = 'invoice-id';
const AMOUNT_FIELD_ID = 'amount-field-id';

const FULL_ACCESS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

flatObjectMetadataMaps.byUniversalIdentifier.invoice =
  getFlatObjectMetadataMock({
    id: INVOICE_ID,
    universalIdentifier: 'invoice',
    applicationId: 'owning-application-id',
    disabledObjectPermissionActions: ['canDestroyObjectRecords'],
  });
flatObjectMetadataMaps.universalIdentifierById[INVOICE_ID] = 'invoice';

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  createEmptyFlatEntityMaps();

flatFieldMetadataMaps.byUniversalIdentifier.amount = getFlatFieldMetadataMock({
  id: AMOUNT_FIELD_ID,
  universalIdentifier: 'amount',
  objectMetadataId: INVOICE_ID,
  type: FieldMetadataType.NUMBER,
  applicationId: 'owning-application-id',
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
});
flatFieldMetadataMaps.universalIdentifierById[AMOUNT_FIELD_ID] = 'amount';

const flatApplicationMaps: ApplicationDefaultRoleMaps = {
  byId: {
    'owning-application-id': {
      id: 'owning-application-id',
      defaultRoleId: 'owning-application-role-id',
      deletedAt: null,
    },
    'other-application-id': {
      id: 'other-application-id',
      defaultRoleId: 'other-application-role-id',
      deletedAt: null,
    },
  },
};

const disabledActionRolesPermissions = Object.fromEntries(
  [
    'user-role-id',
    'owning-application-role-id',
    'other-application-role-id',
  ].map((roleId) => [roleId, { [INVOICE_ID]: FULL_ACCESS }]),
);

describe('getObjectsPermissionsFromRolePermissionConfig disabled actions', () => {
  it.each<{
    actor: string;
    principals: PermissionsPrincipalsContext;
    intersectionOf: RoleIdsBySource;
    canDestroy: boolean;
  }>([
    {
      actor: 'the owning application',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { applicationId: 'owning-application-id' },
        applicationPrincipal: { applicationId: 'owning-application-id' },
      },
      intersectionOf: { applicationRoleId: 'owning-application-role-id' },
      canDestroy: true,
    },
    {
      actor: 'another application',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { applicationId: 'other-application-id' },
        applicationPrincipal: { applicationId: 'other-application-id' },
      },
      intersectionOf: { applicationRoleId: 'other-application-role-id' },
      canDestroy: false,
    },
    {
      actor: 'a user',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { workspaceMemberId: 'member-id' },
        applicationPrincipal: { isCustomApp: true },
      },
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      canDestroy: false,
    },
    {
      actor: 'a user through the owning application',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { workspaceMemberId: 'member-id' },
        applicationPrincipal: { applicationId: 'owning-application-id' },
      },
      intersectionOf: {
        userWorkspaceRoleId: 'user-role-id',
        applicationRoleId: 'owning-application-role-id',
      },
      canDestroy: false,
    },
    {
      actor: "a user holding the owning application's default role",
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { workspaceMemberId: 'member-id' },
        applicationPrincipal: { isCustomApp: true },
      },
      intersectionOf: { userWorkspaceRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: "an API key holding the owning application's default role",
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { apiKeyId: 'api-key-id' },
        applicationPrincipal: { isCustomApp: true },
      },
      intersectionOf: { apiKeyRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: "an agent holding the owning application's default role",
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { agentId: 'agent-id' },
        applicationPrincipal: { isCustomApp: true },
      },
      intersectionOf: { agentRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: 'the owning application with a user holding its default role',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { workspaceMemberId: 'member-id' },
        applicationPrincipal: { applicationId: 'owning-application-id' },
      },
      intersectionOf: {
        userWorkspaceRoleId: 'owning-application-role-id',
        applicationRoleId: 'owning-application-role-id',
      },
      canDestroy: false,
    },
  ])(
    'disabled actions allowed for $actor: $canDestroy',
    ({ principals, intersectionOf, canDestroy }) => {
      const invoicePermissions = getObjectsPermissionsFromRolePermissionConfig({
        rolePermissionConfig: { intersectionOf },
        principals,
        rolesPermissions: disabledActionRolesPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatApplicationMaps,
      })[INVOICE_ID];

      expect(invoicePermissions?.canDestroyObjectRecords).toBe(canDestroy);
      expect(
        invoicePermissions?.restrictedFields[AMOUNT_FIELD_ID]?.canUpdate ===
          false,
      ).toBe(!canDestroy);
      expect(
        invoicePermissions?.restrictedFields[AMOUNT_FIELD_ID]?.canRead,
      ).not.toBe(false);
    },
  );

  it('should keep the label identifier readable and restrict the inverse of a relation or morph relation', () => {
    const COMPANY_ID = 'company-id';
    const objectMaps: FlatEntityMaps<FlatObjectMetadata> =
      createEmptyFlatEntityMaps();

    objectMaps.byUniversalIdentifier.invoice = getFlatObjectMetadataMock({
      id: INVOICE_ID,
      universalIdentifier: 'invoice',
      applicationId: 'owning-application-id',
      labelIdentifierFieldMetadataId: 'invoice-name-field-id',
    });
    objectMaps.universalIdentifierById[INVOICE_ID] = 'invoice';
    objectMaps.byUniversalIdentifier.company = getFlatObjectMetadataMock({
      id: COMPANY_ID,
      universalIdentifier: 'company',
    });
    objectMaps.universalIdentifierById[COMPANY_ID] = 'company';

    const fieldMaps: FlatEntityMaps<FlatFieldMetadata> =
      createEmptyFlatEntityMaps();

    for (const flatFieldMetadata of [
      getFlatFieldMetadataMock({
        id: 'invoice-name-field-id',
        universalIdentifier: 'invoice-name',
        objectMetadataId: INVOICE_ID,
        type: FieldMetadataType.TEXT,
        applicationId: 'owning-application-id',
        disabledFieldPermissionActions: ['canReadFieldValue'],
      }),
      getFlatFieldMetadataMock({
        id: 'invoice-customer-field-id',
        universalIdentifier: 'invoice-customer',
        objectMetadataId: INVOICE_ID,
        type: FieldMetadataType.RELATION,
        applicationId: 'owning-application-id',
        relationTargetObjectMetadataId: COMPANY_ID,
        relationTargetFieldMetadataId: 'company-invoices-field-id',
        disabledFieldPermissionActions: ['canReadFieldValue'],
      }),
      getFlatFieldMetadataMock({
        id: 'invoice-payer-company-field-id',
        universalIdentifier: 'invoice-payer-company',
        objectMetadataId: INVOICE_ID,
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'invoice-payer',
        applicationId: 'owning-application-id',
        relationTargetObjectMetadataId: COMPANY_ID,
        relationTargetFieldMetadataId: 'company-paid-invoices-field-id',
        disabledFieldPermissionActions: ['canReadFieldValue'],
      }),
    ]) {
      fieldMaps.byUniversalIdentifier[flatFieldMetadata.universalIdentifier] =
        flatFieldMetadata;
      fieldMaps.universalIdentifierById[flatFieldMetadata.id] =
        flatFieldMetadata.universalIdentifier;
    }

    const objectsPermissions = getObjectsPermissionsFromRolePermissionConfig({
      principals: undefined,
      rolePermissionConfig: {
        intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      },
      rolesPermissions: {
        'user-role-id': {
          [INVOICE_ID]: FULL_ACCESS,
          [COMPANY_ID]: FULL_ACCESS,
        },
      },
      flatObjectMetadataMaps: objectMaps,
      flatFieldMetadataMaps: fieldMaps,
      flatApplicationMaps,
    });

    expect(
      objectsPermissions[INVOICE_ID]?.restrictedFields['invoice-name-field-id']
        ?.canRead,
    ).not.toBe(false);
    expect(
      objectsPermissions[COMPANY_ID]?.restrictedFields[
        'company-invoices-field-id'
      ]?.canRead,
    ).toBe(false);
    expect(
      objectsPermissions[COMPANY_ID]?.restrictedFields[
        'company-paid-invoices-field-id'
      ]?.canRead,
    ).toBe(false);
  });
});
