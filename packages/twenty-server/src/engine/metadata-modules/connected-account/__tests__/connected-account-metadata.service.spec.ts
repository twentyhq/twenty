import { randomUUID } from 'node:crypto';

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

const WORKSPACE_ID = randomUUID();
const ALICE_USER_WORKSPACE_ID = randomUUID();
const BOB_USER_WORKSPACE_ID = randomUUID();

const ALICE_ACCOUNT_ID = randomUUID();
const BOB_ACCOUNT_ID = randomUUID();
const SHARED_ACCOUNT_ID = randomUUID();

type FakeAccount = Partial<ConnectedAccountEntity> & { id: string };

const aliceUserPrivateAccount: FakeAccount = {
  id: ALICE_ACCOUNT_ID,
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: ALICE_USER_WORKSPACE_ID,
  visibility: 'user',
};

const bobUserPrivateAccount: FakeAccount = {
  id: BOB_ACCOUNT_ID,
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: BOB_USER_WORKSPACE_ID,
  visibility: 'user',
};

const sharedWorkspaceAccount: FakeAccount = {
  id: SHARED_ACCOUNT_ID,
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: ALICE_USER_WORKSPACE_ID,
  visibility: 'workspace',
};

const matchesWhere = (
  account: FakeAccount,
  where: Record<string, unknown> | Record<string, unknown>[],
): boolean => {
  const conditions = Array.isArray(where) ? where : [where];

  return conditions.some((condition) =>
    Object.entries(condition).every(
      ([key, value]) => account[key as keyof FakeAccount] === value,
    ),
  );
};

describe('ConnectedAccountMetadataService - user-workspace visibility scoping', () => {
  let service: ConnectedAccountMetadataService;
  let accounts: FakeAccount[];

  beforeEach(async () => {
    accounts = [
      aliceUserPrivateAccount,
      bobUserPrivateAccount,
      sharedWorkspaceAccount,
    ];

    const mockConnectedAccountRepository = {
      findOne: jest.fn(({ where }) =>
        Promise.resolve(
          accounts.find((account) => matchesWhere(account, where)) ?? null,
        ),
      ),
      find: jest.fn(({ where }) =>
        Promise.resolve(
          accounts.filter((account) => matchesWhere(account, where)),
        ),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectedAccountMetadataService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: mockConnectedAccountRepository,
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: {},
        },
        {
          provide: AppOAuthRevokeService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ConnectedAccountMetadataService>(
      ConnectedAccountMetadataService,
    );
  });

  describe('findUserWorkspaceVisibleConnectedAccountById', () => {
    it("should not return another member's user-private account", async () => {
      const result = await service.findUserWorkspaceVisibleConnectedAccountById(
        {
          id: ALICE_ACCOUNT_ID,
          userWorkspaceId: BOB_USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        },
      );

      expect(result).toBeNull();
    });

    it('should return the caller own user-private account', async () => {
      const result = await service.findUserWorkspaceVisibleConnectedAccountById(
        {
          id: BOB_ACCOUNT_ID,
          userWorkspaceId: BOB_USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        },
      );

      expect(result?.id).toBe(BOB_ACCOUNT_ID);
    });

    it('should return a workspace-visibility account for any member', async () => {
      const result = await service.findUserWorkspaceVisibleConnectedAccountById(
        {
          id: SHARED_ACCOUNT_ID,
          userWorkspaceId: BOB_USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        },
      );

      expect(result?.id).toBe(SHARED_ACCOUNT_ID);
    });

    it('should reject a user-private account when no userWorkspaceId is present', async () => {
      const result = await service.findUserWorkspaceVisibleConnectedAccountById(
        {
          id: ALICE_ACCOUNT_ID,
          userWorkspaceId: undefined,
          workspaceId: WORKSPACE_ID,
        },
      );

      expect(result).toBeNull();
    });

    it('should allow a workspace-visibility account when no userWorkspaceId is present', async () => {
      const result = await service.findUserWorkspaceVisibleConnectedAccountById(
        {
          id: SHARED_ACCOUNT_ID,
          userWorkspaceId: undefined,
          workspaceId: WORKSPACE_ID,
        },
      );

      expect(result?.id).toBe(SHARED_ACCOUNT_ID);
    });
  });

  describe('findUserWorkspaceVisibleConnectedAccounts', () => {
    it("should return the caller own and workspace-shared accounts, never another member's private account", async () => {
      const result = await service.findUserWorkspaceVisibleConnectedAccounts({
        userWorkspaceId: BOB_USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
      });

      const ids = result.map((account) => account.id);

      expect(ids).toContain(BOB_ACCOUNT_ID);
      expect(ids).toContain(SHARED_ACCOUNT_ID);
      expect(ids).not.toContain(ALICE_ACCOUNT_ID);
    });

    it('should return only workspace-visibility accounts when no userWorkspaceId is present', async () => {
      const result = await service.findUserWorkspaceVisibleConnectedAccounts({
        userWorkspaceId: undefined,
        workspaceId: WORKSPACE_ID,
      });

      const ids = result.map((account) => account.id);

      expect(ids).toEqual([SHARED_ACCOUNT_ID]);
    });
  });
});
