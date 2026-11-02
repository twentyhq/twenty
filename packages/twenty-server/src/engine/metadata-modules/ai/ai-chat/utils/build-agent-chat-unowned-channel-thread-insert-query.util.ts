import { type PrivateRecordInsertSql } from 'src/engine/permissions/private-record/utils/build-private-record-insert-sql.util';

export const buildAgentChatUnownedChannelThreadInsertQuery = ({
  threadTable,
  privateColumn,
  privateValue,
}: { threadTable: string } & PrivateRecordInsertSql) =>
  `INSERT INTO ${threadTable} (id, title, "channelId"${privateColumn}, "lastActivityAt")
   VALUES ($1, $2, $3${privateValue}, clock_timestamp()) RETURNING *`;
