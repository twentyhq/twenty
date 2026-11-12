import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { resolveRuntimeLimitingRole } from 'src/engine/permissions/role/utils/resolve-runtime-limiting-role.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/internal/combine/utils/is-object-operation-denied-to-principals.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/workflow/common/constants/legacy-workspace-workflow-object-universal-identifiers.constant';

const PERSON_ID = 'person-id';
const COMPANY_ID = 'company-id';
const WORKFLOW_ID = 'workflow-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const CAMPAIGN_ID = 'campaign-id';
const WORKFLOW_RUN_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.universalIdentifier;
const EMAIL_FIELD_ID = 'email-field-id';

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

for (const [id, universalIdentifier, isSystem] of [
  [PERSON_ID, 'person', false],
  [COMPANY_ID, 'company', false],
  [WORKFLOW_ID, LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER, false],
  [WORKFLOW_RUN_ID, WORKFLOW_RUN_UNIVERSAL_IDENTIFIER, false],
  [CAMPAIGN_ID, 'campaign', true],
] as const) {
  flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier] =
    getFlatObjectMetadataMock({
      id,
      universalIdentifier,
      nameSingular: universalIdentifier,
      isSystem,
    });
  flatObjectMetadataMaps.universalIdentifierById[id] = universalIdentifier;
}

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  createEmptyFlatEntityMaps();

flatFieldMetadataMaps.byUniversalIdentifier.email = getFlatFieldMetadataMock({
  id: EMAIL_FIELD_ID,
  universalIdentifier: 'email',
  objectMetadataId: PERSON_ID,
  type: FieldMetadataType.TEXT,
});
flatFieldMetadataMaps.universalIdentifierById[EMAIL_FIELD_ID] = 'email';

const resolve = (
  scope: Parameters<typeof resolveRuntimeLimitingRole>[0]['scope'],
) => {
  const { recordsPermissions, permissionFlags } = resolveRuntimeLimitingRole({
    scope,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  return {
    recordsPermissions,
    grantedPermissionFlags: Object.values(PermissionFlagType).filter(
      (permissionFlag) => permissionFlags[permissionFlag],
    ),
  };
};

describe('resolveRuntimeLimitingRole', () => {
  it('denies everything an empty scope leaves out', () => {
    const { recordsPermissions, grantedPermissionFlags } = resolve({});

    expect(recordsPermissions.objects[PERSON_ID]?.canReadAllRecords).toBe(
      false,
    );
    expect(recordsPermissions.objects[COMPANY_ID]?.canUpdateAllRecords).toBe(
      false,
    );
    expect(grantedPermissionFlags).toEqual([]);
  });

  it('allows only the actions it names on the objects it names', () => {
    const { recordsPermissions } = resolve({
      objectPermissions: [
        { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
      ],
    });

    expect(recordsPermissions.objects[PERSON_ID]).toMatchObject({
      canCreateAllRecords: false,
      canReadAllRecords: true,
      canUpdateAllRecords: false,
    });
    expect(recordsPermissions.objects[COMPANY_ID]?.canReadAllRecords).toBe(
      false,
    );
  });

  it('lets an object entry narrow an action granted on all objects', () => {
    const { recordsPermissions } = resolve({
      canReadAllObjectRecords: true,
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: false },
      ],
    });

    expect(recordsPermissions.objects[PERSON_ID]?.canReadAllRecords).toBe(true);
    expect(recordsPermissions.objects[COMPANY_ID]?.canReadAllRecords).toBe(
      false,
    );
  });

  it('restricts the fields it names', () => {
    const { recordsPermissions } = resolve({
      canReadAllObjectRecords: true,
      fieldPermissions: [
        {
          objectUniversalIdentifier: 'person',
          fieldUniversalIdentifier: 'email',
          canReadFieldValue: false,
        },
      ],
    });

    expect(recordsPermissions.objects[PERSON_ID]?.unreadableFields).toContain(
      EMAIL_FIELD_ID,
    );
  });

  it.each([
    {
      unknown: 'an object',
      scope: {
        objectPermissions: [
          { objectUniversalIdentifier: 'unknown', canReadObjectRecords: false },
        ],
      },
      message: 'Object unknown in an AI run scope does not exist',
    },
    {
      unknown: 'the object of a field',
      scope: {
        fieldPermissions: [
          {
            objectUniversalIdentifier: 'unknown',
            fieldUniversalIdentifier: 'email',
            canReadFieldValue: false,
          },
        ],
      },
      message: 'Object unknown in an AI run scope does not exist',
    },
    {
      unknown: 'a field',
      scope: {
        fieldPermissions: [
          {
            objectUniversalIdentifier: 'person',
            fieldUniversalIdentifier: 'unknown',
            canReadFieldValue: false,
          },
        ],
      },
      message: 'Field unknown in an AI run scope does not exist',
    },
  ])(
    'refuses a scope naming $unknown the workspace does not have',
    ({ scope, message }) => {
      expect(() => resolve(scope)).toThrow(message);
    },
  );

  describe.each([
    {
      objectName: 'legacy workflow',
      objectId: WORKFLOW_ID,
      objectUniversalIdentifier:
        LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
    },
    {
      objectName: 'workflowRun',
      objectId: WORKFLOW_RUN_ID,
      objectUniversalIdentifier: WORKFLOW_RUN_UNIVERSAL_IDENTIFIER,
    },
  ])(
    'on the $objectName object, which the workflows flag grants',
    ({ objectId, objectUniversalIdentifier }) => {
      const WORKFLOWS_FLAG = SystemPermissionFlag[PermissionFlagType.WORKFLOWS];

      it('grants every action with the flag', () => {
        expect(
          resolve({ permissionFlagUniversalIdentifiers: [WORKFLOWS_FLAG] })
            .recordsPermissions.objects[objectId],
        ).toMatchObject({
          canCreateAllRecords: true,
          canReadAllRecords: true,
          canUpdateAllRecords: true,
          canDestroyAllRecords: true,
        });
      });

      it('lets an explicit deny narrow what the flag grants', () => {
        expect(
          resolve({
            permissionFlagUniversalIdentifiers: [WORKFLOWS_FLAG],
            objectPermissions: [
              {
                objectUniversalIdentifier,
                canUpdateObjectRecords: false,
                canDestroyObjectRecords: false,
              },
            ],
          }).recordsPermissions.objects[objectId],
        ).toMatchObject({
          canCreateAllRecords: false,
          canReadAllRecords: true,
          canUpdateAllRecords: false,
          canDestroyAllRecords: false,
        });
      });

      it('never lets an explicit grant stand in for the flag', () => {
        expect(
          resolve({
            objectPermissions: [
              {
                objectUniversalIdentifier,
                canReadObjectRecords: true,
              },
            ],
          }).recordsPermissions.objects[objectId]?.canReadAllRecords,
        ).toBe(false);
      });
    },
  );

  it('refuses a scope that lists an object twice', () => {
    expect(() =>
      resolve({
        objectPermissions: [
          { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
          {
            objectUniversalIdentifier: 'person',
            canUpdateObjectRecords: false,
          },
        ],
      }),
    ).toThrow('An AI run scope lists an object or field more than once');
  });

  it('refuses a field named under an object it does not belong to', () => {
    expect(() =>
      resolve({
        canReadAllObjectRecords: true,
        fieldPermissions: [
          {
            objectUniversalIdentifier: 'company',
            fieldUniversalIdentifier: 'email',
            canReadFieldValue: false,
          },
        ],
      }),
    ).toThrow('Field email does not belong to object company');
  });

  describe('on a system object', () => {
    it('leaves it readable but not writable when the scope grants nothing', () => {
      expect(resolve({}).recordsPermissions.objects[CAMPAIGN_ID]).toMatchObject(
        {
          canCreateAllRecords: false,
          canReadAllRecords: true,
          canUpdateAllRecords: false,
          canSoftDeleteAllRecords: false,
          canDestroyAllRecords: false,
        },
      );
    });

    it('lets a scope grant writing it, on all objects or on that one', () => {
      expect(
        resolve({ canUpdateAllObjectRecords: true }).recordsPermissions.objects[
          CAMPAIGN_ID
        ]?.canUpdateAllRecords,
      ).toBe(true);
      expect(
        resolve({
          objectPermissions: [
            {
              objectUniversalIdentifier: 'campaign',
              canUpdateObjectRecords: true,
            },
          ],
        }).recordsPermissions.objects[CAMPAIGN_ID]?.canUpdateAllRecords,
      ).toBe(true);
    });

    it('refuses an insert by a member who can write it, under a scope that grants nothing', () => {
      const isInsertDenied = (
        runtimeLimitingRole?: PermissionsPrincipalsWithRolesContext['runtimeLimitingRole'],
      ) =>
        isObjectOperationDeniedToPrincipals({
          principals: {
            workspaceId: 'workspace-id',
            mainPrincipal: {
              type: 'workspaceMember',
              roleId: 'member-role-id',
              workspaceMemberId: 'workspace-member-id',
            },
            applicationPrincipal: { type: 'customApplication' },
            ...(isDefined(runtimeLimitingRole) ? { runtimeLimitingRole } : {}),
          },
          metadataMaps: {
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            rolesPermissions: {
              'member-role-id': {
                ...NO_ROLE_RECORDS_PERMISSIONS,
                objects: {
                  [CAMPAIGN_ID]: {
                    canCreateAllRecords: true,
                    canReadAllRecords: true,
                    canUpdateAllRecords: true,
                    canSoftDeleteAllRecords: true,
                    canDestroyAllRecords: true,
                    unreadableFields: [],
                    uneditableFields: [],
                  },
                },
              },
            },
            featureFlagsMap: {},
          },
          flatObjectMetadata: flatObjectMetadataMaps.byUniversalIdentifier
            .campaign as FlatObjectMetadata,
          operationType: 'create',
        });

      expect(isInsertDenied()).toBe(false);
      expect(
        isInsertDenied(
          resolveRuntimeLimitingRole({
            scope: {},
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }),
        ),
      ).toBe(true);
    });
  });

  it('grants the flags it names, and tool flags with all tools', () => {
    expect(
      resolve({
        permissionFlagUniversalIdentifiers: [
          SystemPermissionFlag[PermissionFlagType.SEND_EMAIL_TOOL],
        ],
      }).grantedPermissionFlags,
    ).toEqual([PermissionFlagType.SEND_EMAIL_TOOL]);
    expect(
      resolve({ canAccessAllTools: true }).grantedPermissionFlags,
    ).toContain(PermissionFlagType.HTTP_REQUEST_TOOL);
    expect(
      resolve({ canAccessAllTools: true }).grantedPermissionFlags,
    ).not.toContain(PermissionFlagType.WORKFLOWS);
  });
});
