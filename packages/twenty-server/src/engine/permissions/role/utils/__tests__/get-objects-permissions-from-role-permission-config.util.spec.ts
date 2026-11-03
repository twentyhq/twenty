import {
  FieldMetadataType,
  type ObjectPermissions,
  type ObjectsPermissionsByRoleId,
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/permissions/role/utils/get-objects-permissions-from-role-permission-config.util';
import { validateOperationIsPermittedOrThrow } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';
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
          mainPrincipal: {
            type: 'workspaceMember',
            workspaceMemberId: 'member-id',
          },
          applicationPrincipal: { type: 'customApplication' },
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
    nameSingular: 'invoice',
    fieldIds: [AMOUNT_FIELD_ID],
    applicationId: 'owning-application-id',
    disabledObjectPermissionActions: ['canDestroyObjectRecords'],
  });
flatObjectMetadataMaps.universalIdentifierById[INVOICE_ID] = 'invoice';

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  createEmptyFlatEntityMaps();

flatFieldMetadataMaps.byUniversalIdentifier.amount = getFlatFieldMetadataMock({
  id: AMOUNT_FIELD_ID,
  universalIdentifier: 'amount',
  name: 'amount',
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
        mainPrincipal: {
          type: 'application',
          applicationId: 'owning-application-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'owning-application-id',
        },
      },
      intersectionOf: { applicationRoleId: 'owning-application-role-id' },
      canDestroy: true,
    },
    {
      actor: 'another application',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: {
          type: 'application',
          applicationId: 'other-application-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'other-application-id',
        },
      },
      intersectionOf: { applicationRoleId: 'other-application-role-id' },
      canDestroy: false,
    },
    {
      actor: 'a user',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      },
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      canDestroy: false,
    },
    {
      actor: 'a user through the owning application',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'owning-application-id',
        },
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
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      },
      intersectionOf: { userWorkspaceRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: "an API key holding the owning application's default role",
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { type: 'apiKey', apiKeyId: 'api-key-id' },
        applicationPrincipal: { type: 'customApplication' },
      },
      intersectionOf: { apiKeyRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: "an agent holding the owning application's default role",
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: { type: 'agent', agentId: 'agent-id' },
        applicationPrincipal: { type: 'customApplication' },
      },
      intersectionOf: { agentRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: 'the owning application with a user holding its default role',
      principals: {
        workspaceId: 'workspace-1',
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'owning-application-id',
        },
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

describe('getObjectsPermissionsFromRolePermissionConfig with a scope', () => {
  const USER_PREDICATE: RowLevelPermissionPredicate = {
    id: 'predicate-id',
    fieldMetadataId: AMOUNT_FIELD_ID,
    objectMetadataId: INVOICE_ID,
    operand: RowLevelPermissionPredicateOperand.IS,
    value: 'mine',
    subFieldName: null,
    rowLevelPermissionPredicateGroupId: null,
    workspaceMemberFieldMetadataId: null,
    workspaceMemberSubFieldName: null,
    roleId: 'user-role-id',
  };

  const rolesPermissionsWithPredicate = {
    ...disabledActionRolesPermissions,
    'user-role-id': {
      [INVOICE_ID]: {
        ...FULL_ACCESS,
        rowLevelPermissionPredicates: [USER_PREDICATE],
      },
    },
  };

  const compute = ({
    intersectionOf,
    scopeObjectPermissions,
  }: {
    intersectionOf: RoleIdsBySource;
    scopeObjectPermissions?: ObjectPermissions;
  }) =>
    getObjectsPermissionsFromRolePermissionConfig({
      principals: undefined,
      rolePermissionConfig: {
        intersectionOf,
        scope: {
          objectsPermissions: isDefined(scopeObjectPermissions)
            ? { [INVOICE_ID]: scopeObjectPermissions }
            : {},
          permissionFlags: {},
        },
      },
      rolesPermissions: rolesPermissionsWithPredicate,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatApplicationMaps,
    })[INVOICE_ID];

  it('narrows the roles to what the scope allows', () => {
    const invoicePermissions = compute({
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      scopeObjectPermissions: {
        ...FULL_ACCESS,
        canUpdateObjectRecords: false,
      },
    });

    expect(invoicePermissions?.canReadObjectRecords).toBe(true);
    expect(invoicePermissions?.canUpdateObjectRecords).toBe(false);
  });

  it('never grants what the roles deny', () => {
    const invoicePermissions = compute({
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      scopeObjectPermissions: FULL_ACCESS,
    });

    expect(invoicePermissions?.canDestroyObjectRecords).toBe(false);
  });

  it('denies an object the scope leaves out', () => {
    const invoicePermissions = compute({
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
    });

    expect(invoicePermissions?.canReadObjectRecords).toBe(false);
    expect(invoicePermissions?.canUpdateObjectRecords).toBe(false);
  });

  it("keeps the roles' row-level predicates", () => {
    const invoicePermissions = compute({
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      scopeObjectPermissions: FULL_ACCESS,
    });

    expect(invoicePermissions?.rowLevelPermissionPredicates).toEqual([
      USER_PREDICATE,
    ]);
  });

  it('adds the field restrictions of the scope', () => {
    const invoicePermissions = compute({
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      scopeObjectPermissions: {
        ...FULL_ACCESS,
        restrictedFields: {
          [AMOUNT_FIELD_ID]: { canRead: false, canUpdate: false },
        },
      },
    });

    expect(invoicePermissions?.restrictedFields[AMOUNT_FIELD_ID]).toEqual({
      canRead: false,
      canUpdate: false,
    });
  });

  describe('inserting a record that sets the predicate field', () => {
    // the user role cannot update amount (a disabled action), which its own predicate exempts on insert
    const insertAmount = (invoicePermissions: ObjectPermissions | undefined) =>
      validateOperationIsPermittedOrThrow({
        entityName: 'invoice',
        operationType: 'insert',
        objectsPermissions: isDefined(invoicePermissions)
          ? { [INVOICE_ID]: invoicePermissions }
          : {},
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular: { invoice: INVOICE_ID },
        selectedColumns: [],
        updatedColumns: ['amount'],
      });

    it('is allowed without a scope', () => {
      expect(() =>
        insertAmount(
          getObjectsPermissionsFromRolePermissionConfig({
            principals: undefined,
            rolePermissionConfig: {
              intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
            },
            rolesPermissions: rolesPermissionsWithPredicate,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            flatApplicationMaps,
          })[INVOICE_ID],
        ),
      ).not.toThrow();
    });

    it('is allowed when the scope does not restrict the field', () => {
      expect(() =>
        insertAmount(
          compute({
            intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
            scopeObjectPermissions: FULL_ACCESS,
          }),
        ),
      ).not.toThrow();
    });

    it('is refused when the scope denies writing the field', () => {
      expect(() =>
        insertAmount(
          compute({
            intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
            scopeObjectPermissions: {
              ...FULL_ACCESS,
              restrictedFields: {
                [AMOUNT_FIELD_ID]: { canRead: null, canUpdate: false },
              },
            },
          }),
        ),
      ).toThrow('no permission to write field "amount" on "invoice"');
    });
  });

  it('grants nothing without a role', () => {
    expect(
      compute({ intersectionOf: {}, scopeObjectPermissions: FULL_ACCESS }),
    ).toBeUndefined();
  });
});
