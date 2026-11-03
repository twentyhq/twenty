import {
  FieldMetadataType,
  type ObjectPermissions,
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { validateOperationIsPermittedOrThrow } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { buildPermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/utils/build-permissions-principal-role-maps.util';
import {
  type PermissionsPrincipalRoleMaps,
  resolvePermissionsPrincipalsWithRoles,
} from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';
import { computeObjectsPermissionsForRoles } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-roles.util';

type PrincipalWithRoles = Pick<
  PermissionsPrincipalsWithRolesContext,
  'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
>;

const OBJECT_ID = 'object-1';

const EMPTY_FLAT_OBJECT_METADATA_MAPS: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();
const EMPTY_FLAT_FIELD_METADATA_MAPS: FlatEntityMaps<OrmFlatFieldMetadata> =
  createEmptyFlatEntityMaps();

const buildRoleMaps = (
  flatApplicationMaps: PermissionsPrincipalRoleMaps['flatApplicationMaps'] = {
    byId: {},
  },
): PermissionsPrincipalRoleMaps =>
  buildPermissionsPrincipalRoleMaps({
    userWorkspaceRoleMap: {},
    apiKeyRoleMap: {},
    flatRoleTargetByAgentIdMaps: {},
    flatApplicationMaps,
  });

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

const computeForPrincipal = (principal: PrincipalWithRoles) =>
  computeObjectsPermissionsForRoles({
    principal,
    rolesPermissions,
    flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
    flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
    flatApplicationMaps: { byId: {} },
  });

const computeForPrincipalsContext = ({
  principalsContext,
  roleMaps,
}: {
  principalsContext: PermissionsPrincipalsContext;
  roleMaps: PermissionsPrincipalRoleMaps;
}): ObjectsPermissions => {
  const principal = resolvePermissionsPrincipalsWithRoles({
    principalsContext,
    roleMaps,
  });

  return isDefined(principal)
    ? computeObjectsPermissionsForRoles({
        principal,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: roleMaps.flatApplicationMaps,
      })
    : {};
};

describe('computeObjectsPermissionsForRoles', () => {
  it('should resolve a single role unchanged', () => {
    expect(
      computeForPrincipal({
        mainPrincipal: { type: 'deprecatedRoleOnly', roleId: 'agent-role-id' },
        applicationPrincipal: { type: 'customApplication' },
      }),
    ).toEqual(agentRolePermissions);
  });

  it('should resolve a role held by several principals as that role alone', () => {
    expect(
      computeForPrincipal({
        mainPrincipal: {
          type: 'deprecatedRoleOnly',
          roleId: 'default-role-id',
        },
        applicationPrincipal: {
          type: 'deprecatedRoleOnly',
          roleId: 'default-role-id',
        },
      }),
    ).toEqual(defaultRolePermissions);
  });

  it('should intersect every role when several are provided', () => {
    expect(
      computeForPrincipal({
        mainPrincipal: {
          type: 'deprecatedRoleOnly',
          roleId: 'default-role-id',
        },
        limitingPrincipal: {
          type: 'agent',
          agentId: 'agent-id',
          roleId: 'agent-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      }),
    ).toEqual(defaultRolePermissions);
  });

  it('should not grant a permission that only one of the roles allows', () => {
    expect(
      computeForPrincipal({
        mainPrincipal: {
          type: 'deprecatedRoleOnly',
          roleId: 'default-role-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'application-id',
          roleId: 'agent-role-id',
        },
      })[OBJECT_ID].canReadObjectRecords,
    ).toBe(false);
  });

  it('should deny when one of the intersected roles is missing from the cache', () => {
    expect(
      computeForPrincipal({
        mainPrincipal: { type: 'deprecatedRoleOnly', roleId: 'agent-role-id' },
        limitingPrincipal: {
          type: 'agent',
          agentId: 'agent-id',
          roleId: 'agent-role-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'application-id',
          roleId: 'missing-role-id',
        },
      }),
    ).toEqual({});
  });

  it('should return empty permissions when the role is missing from the cache', () => {
    expect(
      computeForPrincipal({
        mainPrincipal: {
          type: 'apiKey',
          apiKeyId: 'api-key-id',
          roleId: 'missing-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      }),
    ).toEqual({});
  });

  it('should deny when the main principal has no role', () => {
    expect(
      computeForPrincipalsContext({
        principalsContext: {
          workspaceId: 'workspace-id',
          mainPrincipal: {
            type: 'workspaceMember',
            workspaceMemberId: 'member-id',
          },
          limitingPrincipal: {
            type: 'deprecatedRoleOnly',
            roleId: 'agent-role-id',
          },
          applicationPrincipal: { type: 'customApplication' },
        },
        roleMaps: buildRoleMaps(),
      }),
    ).toEqual({});
  });

  it('should deny when the limiting agent has lost its role', () => {
    const roleMaps = {
      ...buildRoleMaps(),
      apiKeyRoleMap: { 'api-key-id': 'default-role-id' },
    };
    const principalsContext: PermissionsPrincipalsContext = {
      workspaceId: 'workspace-id',
      mainPrincipal: { type: 'apiKey', apiKeyId: 'api-key-id' },
      applicationPrincipal: { type: 'customApplication' },
    };

    expect(
      computeForPrincipalsContext({ principalsContext, roleMaps }),
    ).toEqual(defaultRolePermissions);
    expect(
      computeForPrincipalsContext({
        principalsContext: {
          ...principalsContext,
          limitingPrincipal: { type: 'agent', agentId: 'deleted-agent-id' },
        },
        roleMaps,
      }),
    ).toEqual({});
  });

  describe('with member and application principals', () => {
    const computeForMemberThroughApplication = ({
      sourceType = ApplicationRegistrationSourceType.LOCAL,
      applicationRoleId = null,
      memberRoleId = 'default-role-id',
    }: {
      sourceType?: ApplicationRegistrationSourceType;
      applicationRoleId?: string | null;
      memberRoleId?: string | null;
    }) =>
      computeForPrincipalsContext({
        principalsContext: {
          workspaceId: 'workspace-id',
          mainPrincipal: {
            type: 'workspaceMember',
            workspaceMemberId: 'workspace-member-id',
          },
          applicationPrincipal: {
            type: 'application',
            applicationId: 'application-id',
          },
        },
        roleMaps: {
          ...buildRoleMaps({
            byId: {
              'application-id': {
                id: 'application-id',
                defaultRoleId: applicationRoleId,
                sourceType,
                deletedAt: null,
              },
            },
          }),
          flatWorkspaceMemberMaps: {
            byId: { 'workspace-member-id': { userId: 'user-id' } },
            userWorkspaceIdByUserId: { 'user-id': 'user-workspace-id' },
          },
          userWorkspaceRoleMap: isDefined(memberRoleId)
            ? { 'user-workspace-id': memberRoleId }
            : {},
        },
      });

    it('should intersect the member role with the application role', () => {
      expect(
        computeForMemberThroughApplication({
          applicationRoleId: 'agent-role-id',
        }),
      ).toEqual(defaultRolePermissions);
    });

    it('should deny a member without a role', () => {
      expect(
        computeForMemberThroughApplication({
          applicationRoleId: 'agent-role-id',
          memberRoleId: null,
        }),
      ).toEqual({});
    });

    it('should deny an installed application without a role', () => {
      expect(computeForMemberThroughApplication({})).toEqual({});
    });

    it('should fall back to the member role for an OAuth-only application', () => {
      expect(
        computeForMemberThroughApplication({
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        }),
      ).toEqual(defaultRolePermissions);
    });
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

const flatApplicationMaps: PermissionsPrincipalRoleMaps['flatApplicationMaps'] =
  {
    byId: {
      'owning-application-id': {
        id: 'owning-application-id',
        defaultRoleId: 'owning-application-role-id',
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        deletedAt: null,
      },
      'other-application-id': {
        id: 'other-application-id',
        defaultRoleId: 'other-application-role-id',
        sourceType: ApplicationRegistrationSourceType.LOCAL,
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

describe('computeObjectsPermissionsForRoles disabled actions', () => {
  it.each<{
    actor: string;
    principal: PrincipalWithRoles;
    canDestroy: boolean;
  }>([
    {
      actor: 'the owning application',
      principal: {
        mainPrincipal: {
          type: 'application',
          applicationId: 'owning-application-id',
          roleId: 'owning-application-role-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'owning-application-id',
          roleId: 'owning-application-role-id',
        },
      },
      canDestroy: true,
    },
    {
      actor: 'another application',
      principal: {
        mainPrincipal: {
          type: 'application',
          applicationId: 'other-application-id',
          roleId: 'other-application-role-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'other-application-id',
          roleId: 'other-application-role-id',
        },
      },
      canDestroy: false,
    },
    {
      actor: 'a user',
      principal: {
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
          roleId: 'user-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      },
      canDestroy: false,
    },
    {
      actor: 'a user through the owning application',
      principal: {
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
          roleId: 'user-role-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'owning-application-id',
          roleId: 'owning-application-role-id',
        },
      },
      canDestroy: false,
    },
    {
      actor: "a user holding the owning application's default role",
      principal: {
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
          roleId: 'owning-application-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      },
      canDestroy: false,
    },
    {
      actor: "an API key holding the owning application's default role",
      principal: {
        mainPrincipal: {
          type: 'apiKey',
          apiKeyId: 'api-key-id',
          roleId: 'owning-application-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      },
      canDestroy: false,
    },
    {
      actor: "an agent holding the owning application's default role",
      principal: {
        mainPrincipal: {
          type: 'agent',
          agentId: 'agent-id',
          roleId: 'owning-application-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      },
      canDestroy: false,
    },
    {
      actor: 'the owning application with a user holding its default role',
      principal: {
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
          roleId: 'owning-application-role-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'owning-application-id',
          roleId: 'owning-application-role-id',
        },
      },
      canDestroy: false,
    },
  ])(
    'disabled actions allowed for $actor: $canDestroy',
    ({ principal, canDestroy }) => {
      const invoicePermissions = computeObjectsPermissionsForRoles({
        principal,
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

    const objectsPermissions = computeObjectsPermissionsForRoles({
      principal: {
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
          roleId: 'user-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
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

describe('computeObjectsPermissionsForRoles with a scope', () => {
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
    mainPrincipal = { type: 'deprecatedRoleOnly', roleId: 'user-role-id' },
    scopeObjectPermissions,
    hasScope = true,
  }: {
    mainPrincipal?: PermissionsPrincipalsContext['mainPrincipal'];
    scopeObjectPermissions?: ObjectPermissions;
    hasScope?: boolean;
  }) => {
    const principal = resolvePermissionsPrincipalsWithRoles({
      principalsContext: {
        workspaceId: 'workspace-id',
        mainPrincipal,
        applicationPrincipal: { type: 'customApplication' },
        ...(hasScope
          ? {
              scope: {
                objectsPermissions: isDefined(scopeObjectPermissions)
                  ? { [INVOICE_ID]: scopeObjectPermissions }
                  : {},
                permissionFlags: {},
              },
            }
          : {}),
      },
      roleMaps: buildRoleMaps(flatApplicationMaps),
    });

    return isDefined(principal)
      ? computeObjectsPermissionsForRoles({
          principal,
          rolesPermissions: rolesPermissionsWithPredicate,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatApplicationMaps,
        })[INVOICE_ID]
      : undefined;
  };

  it('narrows the roles to what the scope allows', () => {
    const invoicePermissions = compute({
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
      scopeObjectPermissions: FULL_ACCESS,
    });

    expect(invoicePermissions?.canDestroyObjectRecords).toBe(false);
  });

  it('denies an object the scope leaves out', () => {
    const invoicePermissions = compute({});

    expect(invoicePermissions?.canReadObjectRecords).toBe(false);
    expect(invoicePermissions?.canUpdateObjectRecords).toBe(false);
  });

  it("keeps the roles' row-level predicates", () => {
    const invoicePermissions = compute({
      scopeObjectPermissions: FULL_ACCESS,
    });

    expect(invoicePermissions?.rowLevelPermissionPredicates).toEqual([
      USER_PREDICATE,
    ]);
  });

  it('adds the field restrictions of the scope', () => {
    const invoicePermissions = compute({
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
      expect(() => insertAmount(compute({ hasScope: false }))).not.toThrow();
    });

    it('is allowed when the scope does not restrict the field', () => {
      expect(() =>
        insertAmount(
          compute({
            scopeObjectPermissions: FULL_ACCESS,
          }),
        ),
      ).not.toThrow();
    });

    it('is refused when the scope denies writing the field', () => {
      expect(() =>
        insertAmount(
          compute({
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
      compute({
        mainPrincipal: { type: 'apiKey', apiKeyId: 'api-key-without-role' },
        scopeObjectPermissions: FULL_ACCESS,
      }),
    ).toBeUndefined();
  });
});
