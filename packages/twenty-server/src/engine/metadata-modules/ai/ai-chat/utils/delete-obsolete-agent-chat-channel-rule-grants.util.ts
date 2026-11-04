import { RecordShareRowCause } from 'twenty-shared/types';
import {
  type EntityManager,
  type ObjectLiteral,
  type SelectQueryBuilder,
} from 'typeorm';

export const deleteObsoleteAgentChatChannelRuleGrants = async ({
  manager,
  recordShareTable,
  threadObjectMetadataId,
  recordShareScopeCondition,
  channelRuleGrantsQuery,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
  recordShareTable: string;
  threadObjectMetadataId: string;
  recordShareScopeCondition: string;
  channelRuleGrantsQuery: SelectQueryBuilder<ObjectLiteral>;
}): Promise<void> => {
  const matchingChannelRuleGrantQuery = channelRuleGrantsQuery
    .clone()
    .select('1')
    .andWhere('thread.id = record_share."recordId"')
    .andWhere('thread."channelId" = record_share."sourceId"')
    .andWhere('role.id = record_share."principalId"')
    .andWhere('record_share."deletedAt" IS NULL');
  const obsoleteGrantIdsQuery = manager
    .createQueryBuilder()
    .select('record_share.id')
    .from(recordShareTable, 'record_share')
    .where('record_share."objectMetadataId" = :threadObjectMetadataId', {
      threadObjectMetadataId,
    })
    .andWhere('record_share."rowCause" = :rowCause', {
      rowCause: RecordShareRowCause.RULE,
    })
    .andWhere(recordShareScopeCondition)
    .andWhere(`NOT EXISTS (${matchingChannelRuleGrantQuery.getQuery()})`)
    .setParameters(matchingChannelRuleGrantQuery.getParameters());

  await manager
    .createQueryBuilder()
    .delete()
    .from(recordShareTable)
    .where(`id IN (${obsoleteGrantIdsQuery.getQuery()})`)
    .setParameters(obsoleteGrantIdsQuery.getParameters())
    .execute();
};
