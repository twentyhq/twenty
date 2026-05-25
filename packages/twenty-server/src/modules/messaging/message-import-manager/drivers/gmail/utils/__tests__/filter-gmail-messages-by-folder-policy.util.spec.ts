import { MessageFolderImportPolicy } from 'twenty-shared/types';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { filterGmailMessagesByFolderPolicy } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/filter-gmail-messages-by-folder-policy.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

const createMessage = (
  externalId: string,
  labelIds: string[],
): MessageWithParticipants =>
  ({
    externalId,
    messageThreadExternalId: `thread-${externalId}`,
    labelIds,
    participants: [],
  }) as unknown as MessageWithParticipants;

const createChannel = (
  messageFolderImportPolicy: MessageFolderImportPolicy,
  syncedExternalIds: string[],
): Pick<
  MessageChannelEntity,
  'messageFolders' | 'messageFolderImportPolicy'
> =>
  ({
    messageFolderImportPolicy,
    messageFolders: syncedExternalIds.map((externalId) => ({
      externalId,
      isSynced: true,
    })),
  }) as unknown as Pick<
    MessageChannelEntity,
    'messageFolders' | 'messageFolderImportPolicy'
  >;

describe('filterGmailMessagesByFolderPolicy', () => {
  it('should return all messages unchanged when policy is ALL_FOLDERS', () => {
    const messages = [
      createMessage('a', ['CATEGORY_PROMOTIONS']),
      createMessage('b', ['Label_custom']),
    ];

    const result = filterGmailMessagesByFolderPolicy(
      messages,
      createChannel(MessageFolderImportPolicy.ALL_FOLDERS, []),
    );

    expect(result).toStrictEqual(messages);
  });

  it('should exclude messages that are not in any synced folder', () => {
    const inSynced = createMessage('a', ['Label_custom']);
    const notSynced = createMessage('b', ['Label_other']);

    const result = filterGmailMessagesByFolderPolicy(
      [inSynced, notSynced],
      createChannel(MessageFolderImportPolicy.SELECTED_FOLDERS, [
        'Label_custom',
      ]),
    );

    expect(result).toStrictEqual([inSynced]);
  });

  it('should include a message in a synced custom folder even when it carries an excluded category label', () => {
    const message = createMessage('a', [
      'Label_custom',
      'CATEGORY_PROMOTIONS',
    ]);

    const result = filterGmailMessagesByFolderPolicy(
      [message],
      createChannel(MessageFolderImportPolicy.SELECTED_FOLDERS, [
        'Label_custom',
      ]),
    );

    expect(result).toStrictEqual([message]);
  });

  it('should exclude an INBOX message carrying an excluded category label', () => {
    const promotional = createMessage('a', ['INBOX', 'CATEGORY_PROMOTIONS']);

    const result = filterGmailMessagesByFolderPolicy(
      [promotional],
      createChannel(MessageFolderImportPolicy.SELECTED_FOLDERS, ['INBOX']),
    );

    expect(result).toStrictEqual([]);
  });

  it('should include an INBOX message that has no excluded category label', () => {
    const primary = createMessage('a', ['INBOX']);

    const result = filterGmailMessagesByFolderPolicy(
      [primary],
      createChannel(MessageFolderImportPolicy.SELECTED_FOLDERS, ['INBOX']),
    );

    expect(result).toStrictEqual([primary]);
  });

  it('should include an INBOX message when it is also in a synced custom folder despite an excluded category label', () => {
    const message = createMessage('a', [
      'INBOX',
      'Label_custom',
      'CATEGORY_SOCIAL',
    ]);

    const result = filterGmailMessagesByFolderPolicy(
      [message],
      createChannel(MessageFolderImportPolicy.SELECTED_FOLDERS, [
        'INBOX',
        'Label_custom',
      ]),
    );

    expect(result).toStrictEqual([message]);
  });
});
