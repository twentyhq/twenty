import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';

// A participant row is one member's private inbox state, so only its member is granted it
export const buildAgentChatThreadParticipantOwnerShares = ({
  participants,
  objectMetadataId,
}: {
  participants: Pick<
    AgentChatThreadParticipantRow,
    'id' | 'workspaceMemberId'
  >[];
  objectMetadataId: string;
}): RecordShareInput[] =>
  participants.map(({ id, workspaceMemberId }) => ({
    objectMetadataId,
    recordId: id,
    principalId: workspaceMemberId,
    principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
    accessLevel: RecordShareAccessLevel.FULL,
    rowCause: RecordShareRowCause.OWNER,
    sourceId: id,
  }));
