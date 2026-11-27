import { type LegacyObjectPermissionManifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const AGENT_CHAT_OBJECT_PERMISSIONS: LegacyObjectPermissionManifest[] = [
  STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
].map((objectUniversalIdentifier) => ({
  objectUniversalIdentifier,
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
}));
