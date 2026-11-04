import chunk from 'lodash.chunk';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { type EntityManager } from 'typeorm';

import { type AgentChatChannelRuleGrant } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-rule-grant.type';

const CHANNEL_RULE_GRANT_INSERT_BATCH_SIZE = 1000;

export const insertMissingAgentChatChannelRuleGrants = async ({
  manager,
  recordShareTable,
  threadObjectMetadataId,
  missingGrants,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
  recordShareTable: string;
  threadObjectMetadataId: string;
  missingGrants: AgentChatChannelRuleGrant[];
}): Promise<void> => {
  for (const missingGrantBatch of chunk(
    missingGrants,
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
        missingGrantBatch.map(({ recordId, principalId, sourceId }) => ({
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
