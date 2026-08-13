import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type PersistedMessage = Pick<
  MessageWorkspaceEntity,
  'id' | 'headerMessageId' | 'isDraft' | 'messageThreadId' | 'subject' | 'text'
> & {
  messageChannelMessageAssociations: Pick<
    MessageChannelMessageAssociationWorkspaceEntity,
    'messageChannelId' | 'messageExternalId'
  >[];
  messageParticipants: Pick<
    MessageParticipantWorkspaceEntity,
    'handle' | 'role'
  >[];
};

export const findPersistedMessages = async ({
  workspaceId,
  subject,
}: {
  workspaceId: string;
  subject: string;
}): Promise<PersistedMessage[]> => {
  const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return global.testDataSource.query(
    `SELECT
      "message"."id",
      "message"."headerMessageId",
      "message"."isDraft",
      "message"."messageThreadId",
      "message"."subject",
      "message"."text",
      COALESCE((
        SELECT json_agg(json_build_object(
          'messageChannelId', "association"."messageChannelId",
          'messageExternalId', "association"."messageExternalId"
        ))
        FROM ${schemaName}."messageChannelMessageAssociation" AS "association"
        WHERE "association"."messageId" = "message"."id"
      ), '[]') AS "messageChannelMessageAssociations",
      COALESCE((
        SELECT json_agg(json_build_object(
          'handle', "participant"."handle",
          'role', "participant"."role"
        ))
        FROM ${schemaName}."messageParticipant" AS "participant"
        WHERE "participant"."messageId" = "message"."id"
      ), '[]') AS "messageParticipants"
    FROM ${schemaName}."message" AS "message"
    WHERE "message"."subject" = $1`,
    [subject],
  );
};
