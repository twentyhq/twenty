import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const DIRECT_MESSAGE_CONTENT_OBJECT_NAMES = [
  'agentChatThread',
  'agentChatThreadParticipant',
  'agentChatThreadTarget',
  'agentTurn',
  'agentMessage',
  'agentMessagePart',
  'agentMessageReaction',
] as const;

type FindRecord = (input: {
  objectName: string;
  recordId: string;
  select: string[];
}) => Promise<ObjectRecord | null>;

const findThreadId = async ({
  objectName,
  recordId,
  findRecord,
}: {
  objectName: (typeof DIRECT_MESSAGE_CONTENT_OBJECT_NAMES)[number];
  recordId: string;
  findRecord: FindRecord;
}): Promise<string | undefined> => {
  if (objectName === 'agentChatThread') {
    return recordId;
  }

  const isMessageChild =
    objectName === 'agentMessagePart' || objectName === 'agentMessageReaction';
  const parentIdField = isMessageChild ? 'messageId' : 'threadId';
  const record = await findRecord({
    objectName,
    recordId,
    select: [parentIdField],
  });
  const parentId = record?.[parentIdField];

  if (!isNonEmptyString(parentId)) {
    return undefined;
  }

  if (!isMessageChild) {
    return parentId;
  }

  const message = await findRecord({
    objectName: 'agentMessage',
    recordId: parentId,
    select: ['threadId'],
  });

  return isNonEmptyString(message?.threadId) ? message.threadId : undefined;
};

export const isDirectMessageContentRecord = async ({
  flatObjectMetadata,
  recordId,
  findRecord,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>;
  recordId: string;
  findRecord: FindRecord;
}): Promise<boolean> => {
  const objectName = DIRECT_MESSAGE_CONTENT_OBJECT_NAMES.find(
    (name) =>
      STANDARD_OBJECTS[name].universalIdentifier ===
      flatObjectMetadata.universalIdentifier,
  );

  if (!isDefined(objectName)) {
    return false;
  }

  const threadId = await findThreadId({ objectName, recordId, findRecord });

  if (!isDefined(threadId)) {
    return true;
  }

  const thread = await findRecord({
    objectName: 'agentChatThread',
    recordId: threadId,
    select: ['conversationType'],
  });

  return !isDefined(thread) || thread.conversationType === 'DIRECT_MESSAGE';
};
