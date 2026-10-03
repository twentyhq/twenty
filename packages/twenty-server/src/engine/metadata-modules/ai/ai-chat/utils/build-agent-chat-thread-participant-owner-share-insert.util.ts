import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// A participant row is one member's private inbox state, so its member is the
// only one granted it. Reads its rows (id, workspaceMemberId) from a CTE.
export const buildAgentChatThreadParticipantOwnerShareInsert = ({
  workspaceId,
  participantSource,
  objectMetadataIdParameter,
}: {
  workspaceId: string;
  participantSource: string;
  objectMetadataIdParameter: string;
}) =>
  `INSERT INTO ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."recordShare"
     ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
   SELECT ${objectMetadataIdParameter}::uuid, participant.id, participant."workspaceMemberId", 'WORKSPACE_MEMBER', 'FULL', 'OWNER', participant.id
   FROM ${participantSource} participant
   ON CONFLICT DO NOTHING`;
