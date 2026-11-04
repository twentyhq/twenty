import { RecordShareRowCause } from 'twenty-shared/types';
import { type EntityManager } from 'typeorm';

import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';
import { buildAgentChatChannelGrantScopeConditions } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-grant-scope-conditions.util';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';

type ExistingChannelRuleGrant = Pick<
  RecordShare,
  'id' | 'recordId' | 'principalId' | 'sourceId'
>;

export const findExistingAgentChatChannelRuleGrants = ({
  manager,
  recordShareTable,
  threadObjectMetadataId,
  scope,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
  recordShareTable: string;
  threadObjectMetadataId: string;
  scope: AgentChatChannelGrantScope;
}): Promise<ExistingChannelRuleGrant[]> => {
  const scopeConditions = buildAgentChatChannelGrantScopeConditions(scope);

  return manager
    .createQueryBuilder()
    .select('record_share.id', 'id')
    .addSelect('record_share."recordId"', 'recordId')
    .addSelect('record_share."principalId"', 'principalId')
    .addSelect('record_share."sourceId"', 'sourceId')
    .from(recordShareTable, 'record_share')
    .where('record_share."objectMetadataId" = :threadObjectMetadataId', {
      threadObjectMetadataId,
    })
    .andWhere('record_share."rowCause" = :rowCause', {
      rowCause: RecordShareRowCause.RULE,
    })
    .andWhere('record_share."deletedAt" IS NULL')
    .andWhere(scopeConditions.recordShare, scopeConditions.parameters)
    .getRawMany<ExistingChannelRuleGrant>();
};
