import chunk from 'lodash.chunk';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import {
  type EntityManager,
  type ObjectLiteral,
  type SelectQueryBuilder,
} from 'typeorm';

import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';

type ChannelRuleGrant = Pick<
  RecordShareInput,
  'recordId' | 'principalId' | 'sourceId'
>;

const CHANNEL_RULE_GRANT_INSERT_BATCH_SIZE = 1000;

export const insertMissingAgentChatChannelRuleGrants = async ({
  manager,
  recordShareTable,
  threadObjectMetadataId,
  channelRuleGrantsQuery,
  threadIds,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
  recordShareTable: string;
  threadObjectMetadataId: string;
  channelRuleGrantsQuery: SelectQueryBuilder<ObjectLiteral>;
  threadIds: string[];
}): Promise<void> => {
  const existingChannelRuleGrantQuery = manager
    .createQueryBuilder()
    .select('1')
    .from(recordShareTable, 'record_share')
    .where('record_share."objectMetadataId" = :threadObjectMetadataId')
    .andWhere('record_share."rowCause" = :rowCause')
    .andWhere('record_share."recordId" = thread.id')
    .andWhere('record_share."principalId" = role.id')
    .andWhere('record_share."sourceId" = thread."channelId"')
    .andWhere('record_share."deletedAt" IS NULL');
  const missingChannelRuleGrants = await channelRuleGrantsQuery
    .clone()
    .andWhere('thread.id = ANY(:threadIds::uuid[])', { threadIds })
    .andWhere(`NOT EXISTS (${existingChannelRuleGrantQuery.getQuery()})`)
    .setParameters({
      threadObjectMetadataId,
      rowCause: RecordShareRowCause.RULE,
    })
    .getRawMany<ChannelRuleGrant>();

  for (const channelRuleGrantBatch of chunk(
    missingChannelRuleGrants,
    CHANNEL_RULE_GRANT_INSERT_BATCH_SIZE,
  )) {
    await manager
      .createQueryBuilder()
      .insert()
      .into(recordShareTable, [
        'objectMetadataId',
        'recordId',
        'principalId',
        'sourceId',
        'principalType',
        'accessLevel',
        'rowCause',
      ])
      .values(
        channelRuleGrantBatch.map(({ recordId, principalId, sourceId }) => ({
          objectMetadataId: threadObjectMetadataId,
          recordId,
          principalId,
          sourceId,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
          rowCause: RecordShareRowCause.RULE,
        })),
      )
      .orIgnore()
      .execute();
  }
};
