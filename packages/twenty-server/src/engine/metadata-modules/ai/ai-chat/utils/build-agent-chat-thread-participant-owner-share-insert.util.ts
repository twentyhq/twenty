import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// A participant row is one member's private inbox state, so its member is the
// only one granted it, while still a member. Reads its rows (id,
// workspaceMemberId) from a CTE or table.
export const buildAgentChatThreadParticipantOwnerShareInsert = ({
  workspaceId,
  participantSource,
  objectMetadataIdParameter,
}: {
  workspaceId: string;
  participantSource: string;
  objectMetadataIdParameter: string;
}) => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return `INSERT INTO ${schema}."recordShare"
     ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
   SELECT ${objectMetadataIdParameter}::uuid, participant.id, participant."workspaceMemberId", 'WORKSPACE_MEMBER', 'FULL', 'OWNER', participant.id
   FROM ${participantSource} participant
   JOIN ${schema}."workspaceMember" member
     ON member.id = participant."workspaceMemberId" AND member."deletedAt" IS NULL
   ON CONFLICT DO NOTHING`;
};
