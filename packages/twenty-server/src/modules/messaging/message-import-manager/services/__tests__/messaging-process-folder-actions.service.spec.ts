import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessagingDeleteFolderMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-delete-folder-messages.service';
import { MessagingImportFolderMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-import-folder-messages.service';
import { MessagingProcessFolderActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-folder-actions.service';

describe('MessagingProcessFolderActionsService', () => {
  let workspaceOrmManager: { executeInWorkspaceContext: jest.Mock };
  let messageFolderRepository: { update: jest.Mock; delete: jest.Mock };
  let messagingDeleteFolderMessagesService: {
    deleteFolderMessages: jest.Mock;
  };
  let messagingImportFolderMessagesService: {
    getFolderMessageIdsToImport: jest.Mock;
  };
  let service: MessagingProcessFolderActionsService;

  const messageChannel = {
    id: 'message-channel-1',
    workspaceId: 'workspace-1',
  } as MessageChannelEntity;

  const folderImport = {
    id: 'folder-1',
    pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
  } as MessageFolderEntity;

  const folderDeletion = {
    id: 'folder-2',
    pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
  } as MessageFolderEntity;

  beforeEach(() => {
    workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (callback: () => Promise<void>) => await callback(),
      ),
    };
    messageFolderRepository = { update: jest.fn(), delete: jest.fn() };
    messagingDeleteFolderMessagesService = {
      deleteFolderMessages: jest.fn(),
    };
    messagingImportFolderMessagesService = {
      getFolderMessageIdsToImport: jest.fn(),
    };

    service = new MessagingProcessFolderActionsService(
      workspaceOrmManager as unknown as WorkspaceOrmManager,
      messageFolderRepository as unknown as WorkspaceScopedRepository<MessageFolderEntity>,
      messagingDeleteFolderMessagesService as unknown as MessagingDeleteFolderMessagesService,
      messagingImportFolderMessagesService as unknown as MessagingImportFolderMessagesService,
    );
  });

  it('hands the enumerated ids back without clearing the pending action', async () => {
    messagingImportFolderMessagesService.getFolderMessageIdsToImport.mockResolvedValue(
      ['message-1', 'message-2'],
    );

    const result = await service.processFolderActions(
      messageChannel,
      [folderImport],
      'workspace-1',
    );

    expect(result).toEqual({
      messageExternalIdsToImport: ['message-1', 'message-2'],
      completedImportFolderIds: ['folder-1'],
    });
    expect(messageFolderRepository.update).not.toHaveBeenCalled();
  });

  it('keeps a folder pending when its enumeration failed', async () => {
    messagingImportFolderMessagesService.getFolderMessageIdsToImport.mockRejectedValue(
      new Error('rateLimitExceeded'),
    );

    const result = await service.processFolderActions(
      messageChannel,
      [folderImport],
      'workspace-1',
    );

    expect(result).toEqual({
      messageExternalIdsToImport: [],
      completedImportFolderIds: [],
    });
    expect(messageFolderRepository.update).not.toHaveBeenCalled();
  });

  it('clears the pending action once the caller reports the ids as queued', async () => {
    await service.markFolderImportsAsCompleted(['folder-1'], 'workspace-1');

    expect(messageFolderRepository.update).toHaveBeenCalledTimes(1);
    expect(messageFolderRepository.update).toHaveBeenCalledWith(
      'workspace-1',
      expect.anything(),
      { pendingSyncAction: MessageFolderPendingSyncAction.NONE },
    );
    expect(messageFolderRepository.delete).not.toHaveBeenCalled();
  });

  it('does nothing when no folder import was queued', async () => {
    await service.markFolderImportsAsCompleted([], 'workspace-1');

    expect(messageFolderRepository.update).not.toHaveBeenCalled();
    expect(
      workspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });

  it('deletes a folder marked for deletion instead of queueing it', async () => {
    messagingDeleteFolderMessagesService.deleteFolderMessages.mockResolvedValue(
      undefined,
    );

    const result = await service.processFolderActions(
      messageChannel,
      [folderDeletion],
      'workspace-1',
    );

    expect(result).toEqual({
      messageExternalIdsToImport: [],
      completedImportFolderIds: [],
    });
    expect(messageFolderRepository.delete).toHaveBeenCalledTimes(1);
    expect(messageFolderRepository.update).not.toHaveBeenCalled();
  });
});
