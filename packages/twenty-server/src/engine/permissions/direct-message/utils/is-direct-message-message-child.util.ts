import { type DirectMessagePermissionObject } from 'src/engine/permissions/direct-message/types/direct-message-permission-object.type';

export const isDirectMessageMessageChild = (
  objectName: DirectMessagePermissionObject,
): boolean =>
  objectName === 'agentMessagePart' || objectName === 'agentMessageReaction';
