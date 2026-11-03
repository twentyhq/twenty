import { DIRECT_MESSAGE_ROW_ACCESS_POLICY } from 'src/engine/metadata-modules/ai/ai-chat/row-access/direct-message-row-access-policy';
import { type ObjectRowAccessPolicy } from 'src/engine/permissions/row-policy/types/object-row-access-policy.type';

export const AI_OBJECT_ROW_ACCESS_POLICIES: ObjectRowAccessPolicy[] = [
  DIRECT_MESSAGE_ROW_ACCESS_POLICY,
];
