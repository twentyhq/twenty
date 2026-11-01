import { buildMessageFolderAssociationIdsToDelete } from 'src/modules/messaging/message-import-manager/utils/build-message-folder-association-ids-to-delete.util';

describe('buildMessageFolderAssociationIdsToDelete', () => {
  it('drops the folders a refreshed message is no longer in', () => {
    expect(
      buildMessageFolderAssociationIdsToDelete({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: ['folder-sent'],
          },
        ],
        existingRecords: [
          {
            id: 'record-drafts',
            messageChannelMessageAssociationId: 'association-1',
            messageFolderId: 'folder-drafts',
          },
          {
            id: 'record-sent',
            messageChannelMessageAssociationId: 'association-1',
            messageFolderId: 'folder-sent',
          },
        ],
        refreshedMessageChannelMessageAssociationIds: ['association-1'],
      }),
    ).toEqual(['record-drafts']);
  });

  it('keeps every folder of a message that was not refreshed', () => {
    expect(
      buildMessageFolderAssociationIdsToDelete({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: ['folder-archive'],
          },
        ],
        existingRecords: [
          {
            id: 'record-inbox',
            messageChannelMessageAssociationId: 'association-1',
            messageFolderId: 'folder-inbox',
          },
        ],
        refreshedMessageChannelMessageAssociationIds: [],
      }),
    ).toEqual([]);
  });

  it('keeps the folders of a refreshed message when the provider reports none', () => {
    expect(
      buildMessageFolderAssociationIdsToDelete({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: [],
          },
        ],
        existingRecords: [
          {
            id: 'record-inbox',
            messageChannelMessageAssociationId: 'association-1',
            messageFolderId: 'folder-inbox',
          },
        ],
        refreshedMessageChannelMessageAssociationIds: ['association-1'],
      }),
    ).toEqual([]);
  });
});
