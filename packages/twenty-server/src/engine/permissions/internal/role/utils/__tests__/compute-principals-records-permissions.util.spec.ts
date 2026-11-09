import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { validateOperationIsPermittedOrThrow } from 'src/engine/permissions/internal/role/utils/validate-operation-is-permitted-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type AiRunPermissionScope } from 'src/engine/permissions/principal/types/ai-run-permission-scope.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import {
  type PermissionsPrincipalsRoleMaps,
  resolvePermissionsPrincipalsWithRoles,
} from 'src/engine/permissions/internal/principal/utils/resolve-permissions-principals-with-roles.util';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { computePrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/compute-principals-records-permissions.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

type PrincipalsWithRoles = Pick<
  PermissionsPrincipalsWithRolesContext,
  'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
>;

const OBJECT_ID = 'object-1';

const EMPTY_FLAT_OBJECT_METADATA_MAPS: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();
const EMPTY_FLAT_FIELD_METADATA_MAPS: FlatEntityMaps<OrmFlatFieldMetadata> =
  createEmptyFlatEntityMaps();

const buildRoleMaps = (
  flatApplicationMaps: PermissionsPrincipalsRoleMaps['flatApplicationMaps'] = {
    byId: {},
  },
): PermissionsPrincipalsRoleMaps => ({
  userWorkspaceRoleMap: {},
  apiKeyRoleMap: {},
  flatRoleTargetByAgentIdMaps: {},
  flatApplicationMaps,
});

const buildRoleRecordsPermissions = (
  objects: RoleRecordsPermissions['objects'],
): RoleRecordsPermissions => ({ ...NO_ROLE_RECORDS_PERMISSIONS, objects });

const agentRolePermissions = buildRoleRecordsPermissions({
  [OBJECT_ID]: {
    canCreateAllRecords: false,
    canReadAllRecords: true,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    unreadableFields: [],
    uneditableFields: [],
  },
});

const defaultRolePermissions = buildRoleRecordsPermissions({
  [OBJECT_ID]: {
    canCreateAllRecords: false,
    canReadAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    unreadableFields: [],
    uneditableFields: [],
  },
});

const rolesPermissions: Record<string, RoleRecordsPermissions> = {
  'agent-role-id': agentRolePermissions,
  'default-role-id': defaultRolePermissions,
};

const computeForPrincipals = (principals: PrincipalsWithRoles) =>
  computePrincipalsRecordsPermissions({
    principals,
    rolesPermissions,
    flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
    flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
    flatApplicationMaps: { byId: {} },
  });

const buildMemberAuthContext = ({
  workspaceMemberId,
  applicationId,
  agentId,
}: {
  workspaceMemberId: string;
  applicationId?: string;
  agentId?: string;
}): PermissionsAuthContext => ({
  type: 'user',
  workspace: { id: 'workspace-id' },
  workspaceMemberId,
  ...(isDefined(applicationId) ? { application: { id: applicationId } } : {}),
  ...(isDefined(agentId) ? { agentId } : {}),
});

const buildApiKeyAuthContext = ({
  apiKeyId,
  agentId,
  aiRunScope,
}: {
  apiKeyId: string;
  agentId?: string;
  aiRunScope?: AiRunPermissionScope;
}): PermissionsAuthContext => ({
  type: 'apiKey',
  workspace: { id: 'workspace-id' },
  apiKey: { id: apiKeyId },
  ...(isDefined(agentId) ? { agentId } : {}),
  ...(isDefined(aiRunScope) ? { aiRunScope } : {}),
});

const computeForAuthContext = ({
  authContext,
  roleMaps,
}: {
  authContext: PermissionsAuthContext;
  roleMaps: PermissionsPrincipalsRoleMaps;
}): RoleRecordsPermissions => {
  const principals = resolvePermissionsPrincipalsWithRoles({
    authContext,
    roleMaps,
  });

  return isDefined(principals)
    ? computePrincipalsRecordsPermissions({
        principals,
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
        flatApplicationMaps: roleMaps.flatApplicationMaps,
      })
    : NO_ROLE_RECORDS_PERMISSIONS;
};

describe('computePrincipalsRecordsPermissions', () => {
  it('should resolve a single role unchanged', () => {
    expect(
      computeForPrincipals({
        mainPrincipal: { type: 'role', roleId: 'agent-role-id' },
        applicationPrincipal: { type: 'customApplication' },
      }),
    ).toEqual(agentRolePermissions);
  });

  it('should resolve a role held by several principals as that role alone', () => {
    expect(
      computeForPrincipals({
        mainPrincipal: {
          type: 'role',
          roleId: 'default-role-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'default-application-id',
          roleId: 'default-role-id',
        },
      }),
    ).toEqual(defaultRolePermissions);
  });

  it('should intersect every role when several are provided', () => {
    expect(
      computeForPrincipals({
        mainPrincipal: {
          type: 'role',
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
      computeForPrincipals({
        mainPrincipal: {
          type: 'role',
          roleId: 'default-role-id',
        },
        applicationPrincipal: {
          type: 'application',
          applicationId: 'application-id',
          roleId: 'agent-role-id',
        },
      }).objects[OBJECT_ID]?.canReadAllRecords,
    ).toBe(false);
  });

  it('should deny when one of the intersected roles is missing from the cache', () => {
    expect(
      computeForPrincipals({
        mainPrincipal: { type: 'role', roleId: 'agent-role-id' },
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
    ).toEqual(NO_ROLE_RECORDS_PERMISSIONS);
  });

  it('should return empty permissions when the role is missing from the cache', () => {
    expect(
      computeForPrincipals({
        mainPrincipal: {
          type: 'apiKey',
          apiKeyId: 'api-key-id',
          roleId: 'missing-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      }),
    ).toEqual(NO_ROLE_RECORDS_PERMISSIONS);
  });

  it('should deny when the main principal has no role', () => {
    expect(
      computeForAuthContext({
        authContext: buildMemberAuthContext({
          workspaceMemberId: 'member-id',
          agentId: 'agent-id',
        }),
        roleMaps: {
          ...buildRoleMaps(),
          flatRoleTargetByAgentIdMaps: {
            'agent-id': { roleId: 'agent-role-id' },
          },
        },
      }),
    ).toEqual(NO_ROLE_RECORDS_PERMISSIONS);
  });

  it('should deny when the limiting agent has lost its role', () => {
    const roleMaps = {
      ...buildRoleMaps(),
      apiKeyRoleMap: { 'api-key-id': 'default-role-id' },
    };
    expect(
      computeForAuthContext({
        authContext: buildApiKeyAuthContext({ apiKeyId: 'api-key-id' }),
        roleMaps,
      }),
    ).toEqual(defaultRolePermissions);
    expect(
      computeForAuthContext({
        authContext: buildApiKeyAuthContext({
          apiKeyId: 'api-key-id',
          agentId: 'deleted-agent-id',
        }),
        roleMaps,
      }),
    ).toEqual(NO_ROLE_RECORDS_PERMISSIONS);
  });

  it('should run an application agent within both its role and its application role', () => {
    const roleMaps = {
      ...buildRoleMaps({
        byId: {
          'application-id': {
            id: 'application-id',
            defaultRoleId: 'default-role-id',
            sourceType: ApplicationRegistrationSourceType.LOCAL,
            deletedAt: null,
          },
        },
      }),
      flatRoleTargetByAgentIdMaps: { 'agent-id': { roleId: 'agent-role-id' } },
    };

    expect(
      computeForAuthContext({
        authContext: {
          type: 'application',
          workspace: { id: 'workspace-id' },
          application: { id: 'application-id' },
          agentId: 'agent-id',
        },
        roleMaps,
      }),
    ).toEqual(defaultRolePermissions);
  });

  it('should deny a webhook whose role cannot be found', () => {
    expect(
      computeForAuthContext({
        authContext: {
          type: 'webhook',
          workspace: { id: 'workspace-id' },
          webhook: { id: 'webhook-id' },
        },
        roleMaps: buildRoleMaps(),
      }),
    ).toEqual(NO_ROLE_RECORDS_PERMISSIONS);
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
      computeForAuthContext({
        authContext: buildMemberAuthContext({
          workspaceMemberId: 'workspace-member-id',
          applicationId: 'application-id',
        }),
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
      ).toEqual(NO_ROLE_RECORDS_PERMISSIONS);
    });

    it('should deny an installed application without a role', () => {
      expect(computeForMemberThroughApplication({})).toEqual(
        NO_ROLE_RECORDS_PERMISSIONS,
      );
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

const FULL_ACCESS: ObjectRecordsPermissions = {
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  unreadableFields: [],
  uneditableFields: [],
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

const flatApplicationMaps: PermissionsPrincipalsRoleMaps['flatApplicationMaps'] =
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
  ].map((roleId) => [
    roleId,
    buildRoleRecordsPermissions({ [INVOICE_ID]: FULL_ACCESS }),
  ]),
);

describe('computePrincipalsRecordsPermissions disabled actions', () => {
  it.each<{
    actor: string;
    principals: PrincipalsWithRoles;
    canDestroy: boolean;
  }>([
    {
      actor: 'the owning application',
      principals: {
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
      principals: {
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
      principals: {
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
      principals: {
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
      principals: {
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
      principals: {
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
      principals: {
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
      principals: {
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
    ({ principals, canDestroy }) => {
      const invoicePermissions = computePrincipalsRecordsPermissions({
        principals,
        rolesPermissions: disabledActionRolesPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatApplicationMaps,
      }).objects[INVOICE_ID];

      expect(invoicePermissions?.canDestroyAllRecords).toBe(canDestroy);
      expect(
        invoicePermissions?.uneditableFields.includes(AMOUNT_FIELD_ID),
      ).toBe(!canDestroy);
      expect(
        invoicePermissions?.unreadableFields.includes(AMOUNT_FIELD_ID),
      ).toBe(false);
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

    const { objects } = computePrincipalsRecordsPermissions({
      principals: {
        mainPrincipal: {
          type: 'workspaceMember',
          workspaceMemberId: 'member-id',
          roleId: 'user-role-id',
        },
        applicationPrincipal: { type: 'customApplication' },
      },
      rolesPermissions: {
        'user-role-id': buildRoleRecordsPermissions({
          [INVOICE_ID]: FULL_ACCESS,
          [COMPANY_ID]: FULL_ACCESS,
        }),
      },
      flatObjectMetadataMaps: objectMaps,
      flatFieldMetadataMaps: fieldMaps,
      flatApplicationMaps,
    });

    expect(objects[INVOICE_ID]?.unreadableFields).not.toContain(
      'invoice-name-field-id',
    );
    expect(objects[COMPANY_ID]?.unreadableFields).toContain(
      'company-invoices-field-id',
    );
    expect(objects[COMPANY_ID]?.unreadableFields).toContain(
      'company-paid-invoices-field-id',
    );
  });
});

describe('computePrincipalsRecordsPermissions with a scope', () => {
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
    'user-role-id': buildRoleRecordsPermissions({
      [INVOICE_ID]: {
        canCreateAllRecords: false,
        canReadAllRecords: false,
        canUpdateAllRecords: false,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
        unreadableFields: [],
        uneditableFields: [],
        rowLevelRecordsPermissions: {
          canCreateRecords: true,
          canReadRecords: true,
          canUpdateRecords: true,
          canSoftDeleteRecords: true,
          canDestroyRecords: true,
          predicates: [USER_PREDICATE],
          predicateGroups: [],
        },
      },
    }),
  };

  const compute = ({
    apiKeyId = 'api-key-id',
    scopeObjectPermissions,
    hasScope = true,
  }: {
    apiKeyId?: string;
    scopeObjectPermissions?: ObjectRecordsPermissions;
    hasScope?: boolean;
  }) => {
    const principals = resolvePermissionsPrincipalsWithRoles({
      authContext: buildApiKeyAuthContext({
        apiKeyId,
        aiRunScope: hasScope
          ? {
              recordsPermissions: buildRoleRecordsPermissions(
                isDefined(scopeObjectPermissions)
                  ? { [INVOICE_ID]: scopeObjectPermissions }
                  : {},
              ),
              permissionFlags: {},
            }
          : undefined,
      }),
      roleMaps: {
        ...buildRoleMaps(flatApplicationMaps),
        apiKeyRoleMap: { 'api-key-id': 'user-role-id' },
      },
    });

    return isDefined(principals)
      ? computePrincipalsRecordsPermissions({
          principals,
          rolesPermissions: rolesPermissionsWithPredicate,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatApplicationMaps,
        }).objects[INVOICE_ID]
      : undefined;
  };

  it('narrows the roles to what the scope allows', () => {
    const invoicePermissions = compute({
      scopeObjectPermissions: {
        ...FULL_ACCESS,
        canUpdateAllRecords: false,
      },
    });

    expect(
      canReachSomeRecords({
        objectRecordsPermissions: invoicePermissions,
        operationType: 'read',
      }),
    ).toBe(true);
    expect(
      canReachSomeRecords({
        objectRecordsPermissions: invoicePermissions,
        operationType: 'update',
      }),
    ).toBe(false);
  });

  it('never grants what the roles deny', () => {
    const invoicePermissions = compute({
      scopeObjectPermissions: FULL_ACCESS,
    });

    expect(
      canReachSomeRecords({
        objectRecordsPermissions: invoicePermissions,
        operationType: 'destroy',
      }),
    ).toBe(false);
  });

  it('denies an object the scope leaves out', () => {
    const invoicePermissions = compute({});

    expect(
      canReachSomeRecords({
        objectRecordsPermissions: invoicePermissions,
        operationType: 'read',
      }),
    ).toBe(false);
    expect(
      canReachSomeRecords({
        objectRecordsPermissions: invoicePermissions,
        operationType: 'update',
      }),
    ).toBe(false);
  });

  it("keeps the roles' row-level predicates", () => {
    const invoicePermissions = compute({
      scopeObjectPermissions: FULL_ACCESS,
    });

    expect(invoicePermissions?.rowLevelRecordsPermissions?.predicates).toEqual([
      USER_PREDICATE,
    ]);
  });

  it('adds the field restrictions of the scope', () => {
    const invoicePermissions = compute({
      scopeObjectPermissions: {
        ...FULL_ACCESS,
        unreadableFields: [AMOUNT_FIELD_ID],
        uneditableFields: [AMOUNT_FIELD_ID],
      },
    });

    expect(invoicePermissions?.unreadableFields).toContain(AMOUNT_FIELD_ID);
    expect(invoicePermissions?.uneditableFields).toContain(AMOUNT_FIELD_ID);
  });

  describe('inserting a record that sets the predicate field', () => {
    // the user role cannot update amount (a disabled action), which its own predicate exempts on insert
    const insertAmount = (
      invoicePermissions: ObjectRecordsPermissions | undefined,
    ) =>
      validateOperationIsPermittedOrThrow({
        entityName: 'invoice',
        operationType: 'create',
        recordsPermissions: buildRoleRecordsPermissions(
          isDefined(invoicePermissions)
            ? { [INVOICE_ID]: invoicePermissions }
            : {},
        ),
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
              unreadableFields: [],
              uneditableFields: [AMOUNT_FIELD_ID],
            },
          }),
        ),
      ).toThrow('no permission to write field "amount" on "invoice"');
    });
  });

  it('grants nothing without a role', () => {
    expect(
      compute({
        apiKeyId: 'api-key-without-role',
        scopeObjectPermissions: FULL_ACCESS,
      }),
    ).toBeUndefined();
  });
});
