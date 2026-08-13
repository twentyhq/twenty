import { Test } from '@nestjs/testing';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessagingMessageFolderAssociationService } from 'src/modules/messaging/message-import-manager/services/messaging-message-folder-association.service';

describe('MessagingMessageFolderAssociationService', () => {
  let service: MessagingMessageFolderAssociationService;
  const insertMock = jest.fn();
  const findMock = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MessagingMessageFolderAssociationService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn(
              async (callback: () => Promise<unknown>) => callback(),
            ),
            getRepository: jest.fn(async () => ({
              find: findMock,
              insert: insertMock,
            })),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(MessagingMessageFolderAssociationService);
  });

  it('should not insert the same pair twice when two associations share the same association id and folder', async () => {
    findMock.mockResolvedValue([]);

    await service.saveMessageFolderAssociations(
      [
        {
          messageChannelMessageAssociationId: 'assoc-1',
          messageFolderIds: ['folder-inbox'],
        },
        {
          messageChannelMessageAssociationId: 'assoc-1',
          messageFolderIds: ['folder-inbox'],
        },
      ],
      'workspace-1',
    );

    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock.mock.calls[0][0]).toEqual([
      {
        messageChannelMessageAssociationId: 'assoc-1',
        messageFolderId: 'folder-inbox',
      },
    ]);
  });

  it('should not insert the same pair twice when one association has duplicate folder ids', async () => {
    findMock.mockResolvedValue([]);

    await service.saveMessageFolderAssociations(
      [
        {
          messageChannelMessageAssociationId: 'assoc-1',
          messageFolderIds: ['folder-inbox', 'folder-inbox'],
        },
      ],
      'workspace-1',
    );

    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock.mock.calls[0][0]).toEqual([
      {
        messageChannelMessageAssociationId: 'assoc-1',
        messageFolderId: 'folder-inbox',
      },
    ]);
  });

  it('should filter out pairs already existing in the database', async () => {
    findMock.mockResolvedValue([
      {
        messageChannelMessageAssociationId: 'assoc-1',
        messageFolderId: 'folder-inbox',
      },
    ]);

    await service.saveMessageFolderAssociations(
      [
        {
          messageChannelMessageAssociationId: 'assoc-1',
          messageFolderIds: ['folder-inbox', 'folder-archive'],
        },
      ],
      'workspace-1',
    );

    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock.mock.calls[0][0]).toEqual([
      {
        messageChannelMessageAssociationId: 'assoc-1',
        messageFolderId: 'folder-archive',
      },
    ]);
  });

  it('should not insert when all pairs already exist', async () => {
    findMock.mockResolvedValue([
      {
        messageChannelMessageAssociationId: 'assoc-1',
        messageFolderId: 'folder-inbox',
      },
    ]);

    await service.saveMessageFolderAssociations(
      [
        {
          messageChannelMessageAssociationId: 'assoc-1',
          messageFolderIds: ['folder-inbox'],
        },
      ],
      'workspace-1',
    );

    expect(insertMock).not.toHaveBeenCalled();
  });
});
