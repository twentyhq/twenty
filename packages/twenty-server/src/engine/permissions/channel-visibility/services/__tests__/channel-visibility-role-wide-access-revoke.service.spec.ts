import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ChannelVisibilityRoleWideAccessRevokeService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-role-wide-access-revoke.service';

const APPLICATION = '0b7d0a4e-6f3a-4c55-9a51-1f1e2d3c4b5a';
const OTHER_APPLICATION = '1c8e1b5f-7a4b-4d66-8b62-2a2f3e4d5c6b';
const ROLE = '2d9f2c6a-8b5c-4e77-9c73-3b3a4f5e6d7c';
const OTHER_ROLE = '3e0a3d7b-9c6d-4f88-8d84-4c4b5a6f7e8d';

const { message, calendarEvent } = STANDARD_OBJECTS;

const buildService = () => {
  const validateBuildAndRunWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: 'success' });

  const service = new ChannelVisibilityRoleWideAccessRevokeService(
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: {
            universalIdentifier: 'twenty-standard',
          },
        }),
    } as never,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        rolesPermissions: {},
        flatRoleMaps: {
          byUniversalIdentifier: {
            [ROLE]: {
              id: 'role-id',
              label: 'Seller',
              universalIdentifier: ROLE,
              applicationUniversalIdentifier: APPLICATION,
              canBeAssignedToUsers: true,
            },
            [OTHER_ROLE]: {
              id: 'other-role-id',
              label: 'Member',
              universalIdentifier: OTHER_ROLE,
              applicationUniversalIdentifier: OTHER_APPLICATION,
              canBeAssignedToUsers: true,
            },
          },
        },
        flatObjectPermissionMaps: {
          byUniversalIdentifier: {
            'message-permission': {
              universalIdentifier: 'message-permission',
              applicationUniversalIdentifier: APPLICATION,
              roleUniversalIdentifier: ROLE,
              objectMetadataUniversalIdentifier: message.universalIdentifier,
              canReadObjectRecords: true,
              canCreateObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          },
        },
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [message.universalIdentifier]: { id: 'message-id' },
            [calendarEvent.universalIdentifier]: { id: 'calendar-event-id' },
          },
        },
      }),
    } as never,
    { validateBuildAndRunWorkspaceMigration } as never,
    { scheduleSync: jest.fn() } as never,
  );

  return { service, validateBuildAndRunWorkspaceMigration };
};

const getObjectPermissionOperations = (
  validateBuildAndRunWorkspaceMigration: jest.Mock,
) =>
  validateBuildAndRunWorkspaceMigration.mock.calls.map(([args]) => ({
    applicationUniversalIdentifier: args.applicationUniversalIdentifier,
    created:
      args.allFlatEntityOperationByMetadataName.objectPermission.flatEntityToCreate.map(
        ({
          roleUniversalIdentifier,
          objectMetadataUniversalIdentifier,
        }: Record<string, string>) => [
          roleUniversalIdentifier,
          objectMetadataUniversalIdentifier,
        ],
      ),
    updated:
      args.allFlatEntityOperationByMetadataName.objectPermission.flatEntityToUpdate.map(
        ({ universalIdentifier }: Record<string, string>) =>
          universalIdentifier,
      ),
  }));

describe('ChannelVisibilityRoleWideAccessRevokeService', () => {
  it('revokes role wide access for the user roles of every application', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await service.revokeRoleWideAccess({ workspaceId: 'workspace-id' });

    expect(
      getObjectPermissionOperations(validateBuildAndRunWorkspaceMigration),
    ).toEqual([
      {
        applicationUniversalIdentifier: APPLICATION,
        created: [[ROLE, calendarEvent.universalIdentifier]],
        updated: ['message-permission'],
      },
      {
        applicationUniversalIdentifier: OTHER_APPLICATION,
        created: [
          [OTHER_ROLE, message.universalIdentifier],
          [OTHER_ROLE, calendarEvent.universalIdentifier],
        ],
        updated: [],
      },
    ]);
  });

  it('only creates missing rows for the roles of the given application', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await service.revokeRoleWideAccess({
      workspaceId: 'workspace-id',
      applicationUniversalIdentifier: APPLICATION,
      shouldKeepExistingObjectPermissions: true,
    });

    expect(
      getObjectPermissionOperations(validateBuildAndRunWorkspaceMigration),
    ).toEqual([
      {
        applicationUniversalIdentifier: APPLICATION,
        created: [[ROLE, calendarEvent.universalIdentifier]],
        updated: [],
      },
    ]);
  });
});
