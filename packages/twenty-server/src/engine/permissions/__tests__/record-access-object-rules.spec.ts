import {
  type ObjectRecordsOperationType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildMatrixServices } from 'src/engine/permissions/__tests__/record-access-matrix/build-matrix-services.util';
import {
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.model';
import {
  buildMatrixCacheValues,
  FLAT_OBJECT_METADATA,
  MAIN_APPLICATION_ID,
  OBJECT_ID,
  USER_AUTH_CONTEXT,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.world';
import { type ObjectPermissionAction } from 'twenty-shared/application';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';

const RECORD = { id: 'record-id', status: 'active', deletedAt: null };
const APPLICATION_AUTH_CONTEXT = {
  type: 'application',
  workspace: { id: WORKSPACE_ID },
  application: { id: MAIN_APPLICATION_ID },
} as unknown as WorkspaceAuthContext;
const MEMBER_AUTH_CONTEXT =
  USER_AUTH_CONTEXT as unknown as WorkspaceAuthContext;

const buildCacheValues = ({
  disabledObjectPermissionActions = [],
  objectApplicationId = FLAT_OBJECT_METADATA.applicationId,
  restrictedFieldsByRoleId = {},
  isSharingEnabled = false,
}: {
  disabledObjectPermissionActions?: ObjectPermissionAction[];
  objectApplicationId?: string;
  restrictedFieldsByRoleId?: Record<
    string,
    Record<string, { canRead: boolean | null; canUpdate: boolean | null }>
  >;
  isSharingEnabled?: boolean;
}) => {
  const cacheValues = buildMatrixCacheValues({
    mainRoleGrant: 'allRecords',
    limitingRoleGrant: 'allRecords',
    isSharingEnabled,
  });
  const flatObjectMetadata = {
    ...FLAT_OBJECT_METADATA,
    disabledObjectPermissionActions,
    applicationId: objectApplicationId,
  };

  return {
    flatObjectMetadata,
    cacheValues: {
      ...cacheValues,
      flatObjectMetadataMaps: {
        ...cacheValues.flatObjectMetadataMaps,
        byUniversalIdentifier: {
          [OBJECT_ID]: flatObjectMetadata,
        },
      },
      rolesPermissions: Object.fromEntries(
        Object.entries(cacheValues.rolesPermissions).map(
          ([roleId, rolePermissions]) => [
            roleId,
            {
              ...rolePermissions,
              objects: {
                [OBJECT_ID]: {
                  ...rolePermissions.objects[OBJECT_ID],
                  restrictedFields: restrictedFieldsByRoleId[roleId] ?? {},
                },
              },
            },
          ],
        ),
      ),
    },
  };
};

const findGranted = async ({
  authContext,
  operationType,
  hypotheticalRecordShareAccessLevel,
  ...options
}: Parameters<typeof buildCacheValues>[0] & {
  authContext: WorkspaceAuthContext;
  operationType: ObjectRecordsOperationType;
  hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
}) => {
  const { cacheValues, flatObjectMetadata } = buildCacheValues(options);
  const services = buildMatrixServices(cacheValues);

  return findGrantedRecordIds({
    principals:
      await services.principalPermissionsService.buildPermissionsPrincipalsOrThrow(
        { authContext },
      ),
    metadataMaps: await services.permissionsMetadataMapsService.load({
      workspaceId: WORKSPACE_ID,
    }),
    flatObjectMetadata,
    operationType,
    hypotheticalRecordShareAccessLevel,
    records: [RECORD],
    context: {
      shouldIgnoreSoftDeleteDefaultFilter: false,
      fetchRecordShares: async () => [],
      findPrivateRecordStates: async () =>
        new Map([
          [RECORD.id, { isPrivate: true, createdByWorkspaceMemberId: null }],
        ]),
    },
  });
};

describe('record access object rules', () => {
  describe('disabled object actions', () => {
    it.each<[ObjectPermissionAction, ObjectRecordsOperationType]>([
      ['canReadObjectRecords', 'select'],
      ['canUpdateObjectRecords', 'update'],
      ['canSoftDeleteObjectRecords', 'soft-delete'],
      ['canSoftDeleteObjectRecords', 'restore'],
      ['canDestroyObjectRecords', 'delete'],
    ])(
      '%s denies %s even to a role with all records',
      async (action, operationType) => {
        expect(
          await findGranted({
            authContext: MEMBER_AUTH_CONTEXT,
            operationType,
            disabledObjectPermissionActions: [action],
          }),
        ).toEqual(new Set());
      },
    );

    it('leaves other operations alone', async () => {
      expect(
        await findGranted({
          authContext: MEMBER_AUTH_CONTEXT,
          operationType: 'select',
          disabledObjectPermissionActions: ['canDestroyObjectRecords'],
          hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ,
        }),
      ).toEqual(new Set([RECORD.id]));
    });

    it('does not bind the application owning the object', async () => {
      expect(
        await findGranted({
          authContext: APPLICATION_AUTH_CONTEXT,
          operationType: 'select',
          disabledObjectPermissionActions: ['canReadObjectRecords'],
          objectApplicationId: MAIN_APPLICATION_ID,
          hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ,
        }),
      ).toEqual(new Set([RECORD.id]));
    });

    it('binds any other application', async () => {
      expect(
        await findGranted({
          authContext: APPLICATION_AUTH_CONTEXT,
          operationType: 'select',
          disabledObjectPermissionActions: ['canReadObjectRecords'],
        }),
      ).toEqual(new Set());
    });
  });

  describe('field restrictions', () => {
    const FIELD_ID = 'status-field-id';
    const LIMITED_AUTH_CONTEXT = {
      ...USER_AUTH_CONTEXT,
      agentId: 'agent-id',
    } as unknown as WorkspaceAuthContext;

    const findDeniedFields = async ({
      authContext,
      restrictedFieldsByRoleId,
    }: {
      authContext: WorkspaceAuthContext;
      restrictedFieldsByRoleId: Parameters<
        typeof buildCacheValues
      >[0]['restrictedFieldsByRoleId'];
    }) => {
      const services = buildMatrixServices(
        buildCacheValues({ restrictedFieldsByRoleId }).cacheValues,
      );
      const principals =
        await services.principalPermissionsService.buildPermissionsPrincipalsOrThrow(
          { authContext },
        );
      const question = { principals, objectMetadataId: OBJECT_ID };

      return {
        unreadable:
          await services.recordPermissionsService.findUnreadableFieldMetadataIdsOrThrow(
            question,
          ),
        nonUpdatable:
          await services.recordPermissionsService.findNonUpdatableFieldMetadataIdsOrThrow(
            question,
          ),
      };
    };

    it('restricts nothing by default', async () => {
      expect(
        await findDeniedFields({
          authContext: MEMBER_AUTH_CONTEXT,
          restrictedFieldsByRoleId: {},
        }),
      ).toEqual({ unreadable: new Set(), nonUpdatable: new Set() });
    });

    it('treats an unreadable field as not updatable', async () => {
      expect(
        await findDeniedFields({
          authContext: MEMBER_AUTH_CONTEXT,
          restrictedFieldsByRoleId: {
            [MAIN_ROLE_ID]: { [FIELD_ID]: { canRead: false, canUpdate: null } },
          },
        }),
      ).toEqual({
        unreadable: new Set([FIELD_ID]),
        nonUpdatable: new Set([FIELD_ID]),
      });
    });

    it('keeps a read-only field readable', async () => {
      expect(
        await findDeniedFields({
          authContext: MEMBER_AUTH_CONTEXT,
          restrictedFieldsByRoleId: {
            [MAIN_ROLE_ID]: { [FIELD_ID]: { canRead: null, canUpdate: false } },
          },
        }),
      ).toEqual({
        unreadable: new Set(),
        nonUpdatable: new Set([FIELD_ID]),
      });
    });

    it('applies a restriction held by the limiting role alone', async () => {
      expect(
        await findDeniedFields({
          authContext: LIMITED_AUTH_CONTEXT,
          restrictedFieldsByRoleId: {
            [LIMITING_ROLE_ID]: {
              [FIELD_ID]: { canRead: false, canUpdate: null },
            },
          },
        }),
      ).toMatchObject({ unreadable: new Set([FIELD_ID]) });
    });
  });

  describe('hypothetical share on a private record the role reaches', () => {
    it.each<[ObjectRecordsOperationType, RecordShareAccessLevel, boolean]>([
      ['select', RecordShareAccessLevel.READ, true],
      ['update', RecordShareAccessLevel.READ, false],
      ['update', RecordShareAccessLevel.READ_WRITE, true],
      ['delete', RecordShareAccessLevel.READ_WRITE, false],
      ['delete', RecordShareAccessLevel.FULL, true],
    ])('%s with %s', async (operationType, level, isGranted) => {
      const granted = await findGranted({
        authContext: MEMBER_AUTH_CONTEXT,
        operationType,
        hypotheticalRecordShareAccessLevel: level,
        isSharingEnabled: true,
      });

      expect(granted.has(RECORD.id)).toBe(isGranted);
    });
  });
});
