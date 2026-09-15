import { buildMessageFolderAssociationsToInsert } from 'src/modules/messaging/message-import-manager/utils/build-message-folder-associations-to-insert.util';

describe('buildMessageFolderAssociationsToInsert', () => {
  it('should build one record per association and folder', () => {
    expect(
      buildMessageFolderAssociationsToInsert({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: ['folder-inbox', 'folder-archive'],
          },
        ],
        existingRecords: [],
      }),
    ).toEqual([
      {
        messageChannelMessageAssociationId: 'association-1',
        messageFolderId: 'folder-inbox',
      },
      {
        messageChannelMessageAssociationId: 'association-1',
        messageFolderId: 'folder-archive',
      },
    ]);
  });

  it('should keep a single record when two associations share an association id and a folder', () => {
    expect(
      buildMessageFolderAssociationsToInsert({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: ['folder-inbox'],
          },
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: ['folder-inbox'],
          },
        ],
        existingRecords: [],
      }),
    ).toEqual([
      {
        messageChannelMessageAssociationId: 'association-1',
        messageFolderId: 'folder-inbox',
      },
    ]);
  });

  it('should keep a single record when one association repeats a folder id', () => {
    expect(
      buildMessageFolderAssociationsToInsert({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: ['folder-inbox', 'folder-inbox'],
          },
        ],
        existingRecords: [],
      }),
    ).toEqual([
      {
        messageChannelMessageAssociationId: 'association-1',
        messageFolderId: 'folder-inbox',
      },
    ]);
  });

  it('should skip records already existing', () => {
    expect(
      buildMessageFolderAssociationsToInsert({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: ['folder-inbox', 'folder-archive'],
          },
        ],
        existingRecords: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderId: 'folder-inbox',
          },
        ],
      }),
    ).toEqual([
      {
        messageChannelMessageAssociationId: 'association-1',
        messageFolderId: 'folder-archive',
      },
    ]);
  });

  it('should keep records of different associations sharing a folder', () => {
    expect(
      buildMessageFolderAssociationsToInsert({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: ['folder-inbox'],
          },
          {
            messageChannelMessageAssociationId: 'association-2',
            messageFolderIds: ['folder-inbox'],
          },
        ],
        existingRecords: [],
      }),
    ).toEqual([
      {
        messageChannelMessageAssociationId: 'association-1',
        messageFolderId: 'folder-inbox',
      },
      {
        messageChannelMessageAssociationId: 'association-2',
        messageFolderId: 'folder-inbox',
      },
    ]);
  });

  it('should return an empty array when no association has folders', () => {
    expect(
      buildMessageFolderAssociationsToInsert({
        associations: [
          {
            messageChannelMessageAssociationId: 'association-1',
            messageFolderIds: [],
          },
        ],
        existingRecords: [],
      }),
    ).toEqual([]);
  });
});
