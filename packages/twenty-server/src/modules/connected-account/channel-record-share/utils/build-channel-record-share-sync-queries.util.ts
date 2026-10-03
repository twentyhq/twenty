import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type ChannelRecordShareSource } from 'src/modules/connected-account/channel-record-share/types/channel-record-share-source.type';

const RECORD_SHARE_COLUMNS = `("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")`;

const ON_CONFLICT_DO_NOTHING = `ON CONFLICT ("objectMetadataId", "recordId", "principalId", "rowCause", "sourceId") DO NOTHING`;

// Every query takes the same parameters: $1 workspace id, $2 channel id,
// $3 record object metadata id, $4 the record ids to sync or null for all of
// the channel's records.
export const buildChannelRecordShareSyncQueries = ({
  schemaName,
  source,
}: {
  schemaName: string;
  source: ChannelRecordShareSource;
}): { deleteStaleRecordShares: string; insertRecordShares: string[] } => {
  const channelTable = `core."${source.channelTableName}"`;
  const recordShareTable = `${schemaName}."recordShare"`;
  const channelRecordIdsQuery = source.buildChannelRecordIdsQuery(schemaName);
  const syncedRecords = `(SELECT DISTINCT channel_record."recordId" FROM (${channelRecordIdsQuery}) channel_record
    WHERE $4::uuid[] IS NULL OR channel_record."recordId" = ANY($4::uuid[])) record`;
  const channelAccount = `JOIN ${channelTable} channel ON channel.id = $2
      AND channel."workspaceId" = $1
    JOIN core."connectedAccount" account ON account.id = channel."connectedAccountId"`;

  // A grant stays only while the channel still holds the record and would
  // write that exact grant again, so a re-sync rewrites whatever changed.
  const deleteStaleRecordShares = `DELETE FROM ${recordShareTable} share
    WHERE share."objectMetadataId" = $3
      AND share."sourceId" = $2
      AND ($4::uuid[] IS NULL OR share."recordId" = ANY($4::uuid[]))
      AND NOT EXISTS (
        SELECT 1 FROM (${channelRecordIdsQuery}) channel_record
        ${channelAccount}
        LEFT JOIN core."userWorkspace" membership ON membership.id = account."userWorkspaceId"
          AND membership."deletedAt" IS NULL
        LEFT JOIN ${schemaName}."workspaceMember" member ON member."userId" = membership."userId"
          AND member."deletedAt" IS NULL
        LEFT JOIN core."application" application ON application.id = account."applicationId"
          AND application."deletedAt" IS NULL
        WHERE channel_record."recordId" = share."recordId"
          AND CASE share."rowCause"
            WHEN '${RecordShareRowCause.OWNER}' THEN share."principalId" = member.id
              AND share."principalType" = '${RecordSharePrincipalType.WORKSPACE_MEMBER}'
              AND share."accessLevel" = '${RecordShareAccessLevel.FULL}'
            WHEN '${RecordShareRowCause.APPLICATION}' THEN share."principalId" = application."defaultRoleId"
              AND share."principalType" = '${RecordSharePrincipalType.ROLE}'
              AND share."accessLevel" = '${RecordShareAccessLevel.FULL}'
            WHEN '${RecordShareRowCause.RULE}' THEN channel.visibility = '${source.shareEverythingVisibility}'
              AND share."principalId" = '${EVERYONE_PRINCIPAL_ID}'
              AND share."principalType" = '${RecordSharePrincipalType.EVERYONE}'
              AND share."accessLevel" = '${RecordShareAccessLevel.READ}'
            ELSE FALSE
          END
      )`;

  const insertOwnerRecordShares = `INSERT INTO ${recordShareTable} ${RECORD_SHARE_COLUMNS}
    SELECT $3::uuid, record."recordId", member.id,
      '${RecordSharePrincipalType.WORKSPACE_MEMBER}', '${RecordShareAccessLevel.FULL}', '${RecordShareRowCause.OWNER}', $2::uuid
    FROM ${syncedRecords}
    ${channelAccount}
    JOIN core."userWorkspace" membership ON membership.id = account."userWorkspaceId"
      AND membership."deletedAt" IS NULL
    JOIN ${schemaName}."workspaceMember" member ON member."userId" = membership."userId"
      AND member."deletedAt" IS NULL
    ${ON_CONFLICT_DO_NOTHING}`;

  const insertApplicationRecordShares = `INSERT INTO ${recordShareTable} ${RECORD_SHARE_COLUMNS}
    SELECT $3::uuid, record."recordId", application."defaultRoleId",
      '${RecordSharePrincipalType.ROLE}', '${RecordShareAccessLevel.FULL}', '${RecordShareRowCause.APPLICATION}', $2::uuid
    FROM ${syncedRecords}
    ${channelAccount}
    JOIN core."application" application ON application.id = account."applicationId"
      AND application."deletedAt" IS NULL
    WHERE application."defaultRoleId" IS NOT NULL
    ${ON_CONFLICT_DO_NOTHING}`;

  const insertRuleRecordShares = `INSERT INTO ${recordShareTable} ${RECORD_SHARE_COLUMNS}
    SELECT $3::uuid, record."recordId", '${EVERYONE_PRINCIPAL_ID}',
      '${RecordSharePrincipalType.EVERYONE}', '${RecordShareAccessLevel.READ}', '${RecordShareRowCause.RULE}', $2::uuid
    FROM ${syncedRecords}
    JOIN ${channelTable} channel ON channel.id = $2
      AND channel."workspaceId" = $1
      AND channel.visibility = '${source.shareEverythingVisibility}'
    ${ON_CONFLICT_DO_NOTHING}`;

  return {
    deleteStaleRecordShares,
    insertRecordShares: [
      insertOwnerRecordShares,
      insertApplicationRecordShares,
      insertRuleRecordShares,
    ],
  };
};
