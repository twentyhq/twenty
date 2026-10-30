import { AGENT_CHAT_THREAD_PARTICIPANT_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-columns.constant';
import { buildAgentChatThreadParticipantOwnerShareInsert } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-share-insert.util';

export const buildAgentChatThreadParticipantWriteWithOwnerShareQuery = ({
  workspaceId,
  participantWriteQuery,
  objectMetadataIdParameter,
}: {
  workspaceId: string;
  participantWriteQuery: string;
  objectMetadataIdParameter: string;
}): string =>
  `WITH written_participant AS (
     ${participantWriteQuery}
   ), owner_share AS (
     ${buildAgentChatThreadParticipantOwnerShareInsert({
       workspaceId,
       participantSource: 'written_participant',
       objectMetadataIdParameter,
     })}
   )
   SELECT ${AGENT_CHAT_THREAD_PARTICIPANT_COLUMNS} FROM written_participant`;
