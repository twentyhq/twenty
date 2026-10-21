import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { FindOperator } from 'typeorm';

import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CONNECTED_ACCOUNT_DELETED_EVENT } from 'src/engine/metadata-modules/connected-account/constants/connected-account-deleted.constant';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountOwnershipTransferService } from 'src/engine/metadata-modules/connected-account/services/connected-account-ownership-transfer.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const REMOVED_USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const CUSTODIAN_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';
const OTHER_USER_WORKSPACE_ID = '20202020-4444-4444-8444-444444444444';

type ConnectedAccountRow = Pick<
  ConnectedAccountEntity,
  | 'id'
  | 'workspaceId'
  | 'userWorkspaceId'
  | 'provider'
  | 'scope'
  | 'archivedAt'
  | 'accessToken'
  | 'refreshToken'
  | 'connectionProviderId'
>;

const buildConnectedAccountRow = (
  overrides: Pick<ConnectedAccountRow, 'id' | 'provider' | 'scope'> &
    Partial<ConnectedAccountRow>,
): ConnectedAccountRow => ({
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: REMOVED_USER_WORKSPACE_ID,
  archivedAt: null,
  accessToken: 'enc:access-token' as EncryptedString,
  refreshToken: 'enc:refresh-token' as EncryptedString,
  connectionProviderId: null,
  ...overrides,
});

const matchesWhere = (
  row: ConnectedAccountRow,
  where: Record<string, unknown>,
): boolean =>
  Object.entries(where).every(([key, condition]) => {
    const value = row[key as keyof ConnectedAccountRow];

    if (condition instanceof FindOperator) {
      if (condition.type === 'in') {
        return (condition.value as unknown[]).includes(value);
      }

      if (condition.type === 'isNull') {
        return value === null;
      }

      throw new Error(`Unsupported operator ${condition.type}`);
    }

    return value === condition;
  });

const buildInMemoryConnectedAccountRepository = (
  rows: ConnectedAccountRow[],
  failingDeleteIds: string[],
) => {
  const findRows = (where: Record<string, unknown>) =>
    rows.filter((row) => matchesWhere(row, where)).map((row) => ({ ...row }));

  const entityManager = {
    update: jest.fn(
      async (
        entity: unknown,
        where: Record<string, unknown>,
        data: Partial<ConnectedAccountRow>,
      ) => {
        if (entity !== ConnectedAccountEntity) {
          return;
        }

        rows
          .filter((row) => matchesWhere(row, where))
          .forEach((row) => Object.assign(row, data));
      },
    ),
  };

  return {
    find: jest.fn(async ({ where }: { where: Record<string, unknown> }) =>
      findRows(where),
    ),
    findOne: jest.fn(
      async ({ where }: { where: Record<string, unknown> }) =>
        findRows(where)[0] ?? null,
    ),
    findOneOrFail: jest.fn(
      async ({ where }: { where: Record<string, unknown> }) => {
        const [row] = findRows(where);

        if (row === undefined) {
          throw new Error('Connected account not found');
        }

        return row;
      },
    ),
    delete: jest.fn(async ({ id }: { id: string }) => {
      if (failingDeleteIds.includes(id)) {
        throw new Error('Database unavailable');
      }

      rows.splice(
        rows.findIndex((row) => row.id === id),
        1,
      );
    }),
    manager: {
      transaction: jest.fn(
        async (callback: (manager: typeof entityManager) => Promise<void>) =>
          callback(entityManager),
      ),
    },
  };
};

describe('ConnectedAccountOwnershipTransferService', () => {
  let rows: ConnectedAccountRow[];
  let failingDeleteIds: string[];
  let custodianUserWorkspace: Pick<UserWorkspaceEntity, 'id'> | undefined;
  let workspaceEventEmitter: { emitCustomBatchEvent: jest.Mock };
  let appOAuthRevokeService: { revokeIfApp: jest.Mock };
  let connectionProviderLifecycleHookService: { runOnDisconnect: jest.Mock };
  let service: ConnectedAccountOwnershipTransferService;

  const removedUserWorkspace = {
    id: REMOVED_USER_WORKSPACE_ID,
    workspaceId: WORKSPACE_ID,
  } as UserWorkspaceEntity;

  const findRow = (id: string) => rows.find((row) => row.id === id);

  beforeEach(async () => {
    rows = [
      buildConnectedAccountRow({
        id: 'personal-app-1',
        provider: ConnectedAccountProvider.APP,
        scope: 'USER',
        connectionProviderId: 'connection-provider-id',
      }),
      buildConnectedAccountRow({
        id: 'personal-app-2',
        provider: ConnectedAccountProvider.APP,
        scope: 'USER',
        connectionProviderId: 'connection-provider-id',
      }),
      buildConnectedAccountRow({
        id: 'workspace-app',
        provider: ConnectedAccountProvider.APP,
        scope: 'WORKSPACE',
        connectionProviderId: 'connection-provider-id',
      }),
      buildConnectedAccountRow({
        id: 'google-mailbox',
        provider: ConnectedAccountProvider.GOOGLE,
        scope: 'USER',
      }),
      buildConnectedAccountRow({
        id: 'other-member-personal-app',
        provider: ConnectedAccountProvider.APP,
        scope: 'USER',
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      }),
    ];
    failingDeleteIds = [];
    custodianUserWorkspace = { id: CUSTODIAN_USER_WORKSPACE_ID };
    workspaceEventEmitter = { emitCustomBatchEvent: jest.fn() };
    appOAuthRevokeService = { revokeIfApp: jest.fn() };
    connectionProviderLifecycleHookService = { runOnDisconnect: jest.fn() };
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    const emptyChannelRepository = { find: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectedAccountOwnershipTransferService,
        ConnectedAccountMetadataService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useFactory: () =>
            buildInMemoryConnectedAccountRepository(rows, failingDeleteIds),
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: emptyChannelRepository,
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: emptyChannelRepository,
        },
        {
          provide: UserRoleService,
          useValue: {
            resolveCustodianUserWorkspace: jest.fn(
              async () => custodianUserWorkspace,
            ),
          },
        },
        { provide: AppOAuthRevokeService, useValue: appOAuthRevokeService },
        {
          provide: ConnectionProviderLifecycleHookService,
          useValue: connectionProviderLifecycleHookService,
        },
        { provide: PermissionsService, useValue: {} },
        { provide: WorkspaceEventEmitter, useValue: workspaceEventEmitter },
        { provide: CalendarWebhookSubscriptionService, useValue: {} },
        { provide: MessagingWebhookSubscriptionService, useValue: {} },
      ],
    }).compile();

    service = module.get(ConnectedAccountOwnershipTransferService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes the removed member personal app connections instead of transferring them', async () => {
    await service.transferConnectedAccountsOwnershipToCustodian({
      removedUserWorkspace,
    });

    expect(findRow('personal-app-1')).toBeUndefined();
    expect(findRow('personal-app-2')).toBeUndefined();
    expect(
      connectionProviderLifecycleHookService.runOnDisconnect,
    ).toHaveBeenCalledWith({
      connectionProviderId: 'connection-provider-id',
      workspaceId: WORKSPACE_ID,
      connectedAccountId: 'personal-app-1',
    });
    expect(appOAuthRevokeService.revokeIfApp).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'personal-app-1' }),
    );
    expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
      CONNECTED_ACCOUNT_DELETED_EVENT,
      [
        {
          connectedAccountId: 'personal-app-1',
          userWorkspaceId: REMOVED_USER_WORKSPACE_ID,
        },
      ],
      WORKSPACE_ID,
    );
    expect(findRow('other-member-personal-app')).toMatchObject({
      userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      archivedAt: null,
    });
  });

  it('transfers mailboxes and workspace app connections to the custodian', async () => {
    await service.transferConnectedAccountsOwnershipToCustodian({
      removedUserWorkspace,
    });

    for (const id of ['workspace-app', 'google-mailbox']) {
      expect(findRow(id)).toMatchObject({
        userWorkspaceId: CUSTODIAN_USER_WORKSPACE_ID,
        archivedAt: expect.any(Date),
        accessToken: null,
        refreshToken: null,
      });
    }
  });

  it('aborts the removal when a personal app connection fails to delete', async () => {
    failingDeleteIds.push('personal-app-1');

    await expect(
      service.transferConnectedAccountsOwnershipToCustodian({
        removedUserWorkspace,
      }),
    ).rejects.toThrow('Database unavailable');

    for (const id of [
      'personal-app-1',
      'personal-app-2',
      'workspace-app',
      'google-mailbox',
    ]) {
      expect(findRow(id)).toMatchObject({
        userWorkspaceId: REMOVED_USER_WORKSPACE_ID,
        archivedAt: null,
      });
    }
  });

  it('still deletes personal app connections and leaves the rest untouched when there is no custodian', async () => {
    custodianUserWorkspace = undefined;

    await service.transferConnectedAccountsOwnershipToCustodian({
      removedUserWorkspace,
    });

    expect(findRow('personal-app-1')).toBeUndefined();
    expect(findRow('personal-app-2')).toBeUndefined();

    for (const id of ['workspace-app', 'google-mailbox']) {
      expect(findRow(id)).toMatchObject({
        userWorkspaceId: REMOVED_USER_WORKSPACE_ID,
        archivedAt: null,
        accessToken: 'enc:access-token',
      });
    }
  });
});
