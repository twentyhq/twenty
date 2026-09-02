import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { In } from 'typeorm';

describe('ConnectedAccountMetadataService', () => {
  let service: ConnectedAccountMetadataService;
  let connectedAccountRepository: {
    find: jest.Mock;
  };

  const workspaceId = 'workspace-1';
  const userWorkspaceId = 'user-workspace-1';

  const ownAccount = {
    id: 'own-account-1',
    userWorkspaceId,
    workspaceId,
    visibility: 'user',
  } as ConnectedAccountEntity;

  const sharedAccount = {
    id: 'shared-account-1',
    userWorkspaceId: 'someone-else',
    workspaceId,
    visibility: 'workspace',
  } as ConnectedAccountEntity;

  beforeEach(async () => {
    connectedAccountRepository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectedAccountMetadataService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: { find: jest.fn() },
        },
        { provide: AppOAuthRevokeService, useValue: {} },
        { provide: ConnectionProviderLifecycleHookService, useValue: {} },
        { provide: WorkspaceEventEmitter, useValue: {} },
      ],
    }).compile();

    service = module.get(ConnectedAccountMetadataService);
  });

  describe('findByUserWorkspaceId', () => {
    it("returns only the caller's own accounts when there are no shared accounts", async () => {
      connectedAccountRepository.find
        .mockResolvedValueOnce([ownAccount])
        .mockResolvedValueOnce([]);

      const result = await service.findByUserWorkspaceId({
        userWorkspaceId,
        workspaceId,
      });

      expect(result).toEqual([ownAccount]);
      expect(connectedAccountRepository.find).toHaveBeenCalledTimes(2);
      expect(connectedAccountRepository.find).toHaveBeenNthCalledWith(1, {
        where: { userWorkspaceId, workspaceId },
      });
      expect(connectedAccountRepository.find).toHaveBeenNthCalledWith(2, {
        where: { workspaceId, visibility: 'workspace' },
        select: ['id'],
      });
    });

    it('includes workspace-shared accounts alongside the own accounts', async () => {
      connectedAccountRepository.find
        .mockResolvedValueOnce([ownAccount])
        .mockResolvedValueOnce([{ id: sharedAccount.id }])
        .mockResolvedValueOnce([sharedAccount]);

      const result = await service.findByUserWorkspaceId({
        userWorkspaceId,
        workspaceId,
      });

      expect(result).toEqual([ownAccount, sharedAccount]);
      expect(connectedAccountRepository.find).toHaveBeenCalledTimes(3);
      expect(connectedAccountRepository.find).toHaveBeenNthCalledWith(3, {
        where: {
          id: In([sharedAccount.id]),
          workspaceId,
          visibility: 'workspace',
        },
      });
    });

    it('does not duplicate an account that is both own and shared, and skips the third query', async () => {
      connectedAccountRepository.find
        .mockResolvedValueOnce([ownAccount])
        .mockResolvedValueOnce([{ id: ownAccount.id }]);

      const result = await service.findByUserWorkspaceId({
        userWorkspaceId,
        workspaceId,
      });

      expect(result).toEqual([ownAccount]);
      expect(connectedAccountRepository.find).toHaveBeenCalledTimes(2);
    });
  });
});
