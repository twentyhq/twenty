import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  type EntityManager,
  type ObjectLiteral,
  type SelectQueryBuilder,
} from 'typeorm';

import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type AgentChatChannelGrantScope =
  | { threadIds: string[] }
  | { channelId: string };

type ChannelRuleGrant = Pick<
  RecordShareInput,
  'recordId' | 'principalId' | 'sourceId'
>;

type QueryBuilderManager = Pick<EntityManager, 'createQueryBuilder'>;

type ChannelRuleGrantWrite = {
  manager: QueryBuilderManager;
  schema: string;
  threadObjectMetadataId: string;
  channelRuleGrantsQuery: SelectQueryBuilder<ObjectLiteral>;
};

const CHANNEL_RULE_GRANT_INSERT_BATCH_SIZE = 1000;

const ROLE_CAN_ACCESS_THREAD_CHANNEL =
  '(role."canAccessAllAgentChatChannels" = true OR channel_role.id IS NOT NULL)';

const buildScopeConditions = (scope: AgentChatChannelGrantScope) =>
  'threadIds' in scope
    ? {
        thread: 'thread.id = ANY(:threadIds::uuid[])',
        recordShare: 'record_share."recordId" = ANY(:threadIds::uuid[])',
        parameters: { threadIds: scope.threadIds },
      }
    : {
        thread: 'thread."channelId" = :channelId',
        recordShare: 'record_share."sourceId" = :channelId',
        parameters: { channelId: scope.channelId },
      };

const findThreadObjectMetadataId = async ({
  manager,
  workspaceId,
}: {
  manager: QueryBuilderManager;
  workspaceId: string;
}): Promise<string | undefined> => {
  const threadObjectMetadata = await manager
    .createQueryBuilder()
    .select('object_metadata.id', 'id')
    .from(ObjectMetadataEntity, 'object_metadata')
    .where('object_metadata."workspaceId" = :workspaceId', { workspaceId })
    .andWhere('object_metadata."universalIdentifier" = :universalIdentifier', {
      universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    })
    .getRawOne<{ id: string }>();

  return threadObjectMetadata?.id;
};

const deleteObsoleteChannelRuleGrants = async ({
  manager,
  schema,
  threadObjectMetadataId,
  recordShareScopeCondition,
  channelRuleGrantsQuery,
}: ChannelRuleGrantWrite & {
  recordShareScopeCondition: string;
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
    .from(`${schema}.recordShare`, 'record_share')
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
    .from(`${schema}.recordShare`)
    .where(`id IN (${obsoleteGrantIdsQuery.getQuery()})`)
    .setParameters(obsoleteGrantIdsQuery.getParameters())
    .execute();
};

const insertChannelRuleGrants = async ({
  manager,
  schema,
  threadObjectMetadataId,
  channelRuleGrantsQuery,
}: ChannelRuleGrantWrite): Promise<void> => {
  let lastInsertedGrant: ChannelRuleGrant | undefined;

  while (true) {
    const batchQuery = channelRuleGrantsQuery
      .clone()
      .orderBy('thread.id')
      .addOrderBy('role.id')
      .limit(CHANNEL_RULE_GRANT_INSERT_BATCH_SIZE)
      .setLock('for_key_share', undefined, ['thread']);

    if (isDefined(lastInsertedGrant)) {
      batchQuery.andWhere(
        '(thread.id, role.id) > (:lastThreadId::uuid, :lastRoleId::uuid)',
        {
          lastThreadId: lastInsertedGrant.recordId,
          lastRoleId: lastInsertedGrant.principalId,
        },
      );
    }

    const channelRuleGrantBatch =
      await batchQuery.getRawMany<ChannelRuleGrant>();

    if (!isNonEmptyArray(channelRuleGrantBatch)) {
      return;
    }

    await manager
      .createQueryBuilder()
      .insert()
      .into(`${schema}.recordShare`, [
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

    if (channelRuleGrantBatch.length < CHANNEL_RULE_GRANT_INSERT_BATCH_SIZE) {
      return;
    }

    lastInsertedGrant = channelRuleGrantBatch[channelRuleGrantBatch.length - 1];
  }
};

export const replaceAgentChatChannelRuleGrants = async ({
  manager,
  workspaceId,
  scope,
}: {
  manager: QueryBuilderManager;
  workspaceId: string;
  scope: AgentChatChannelGrantScope;
}): Promise<void> => {
  if ('threadIds' in scope && !isNonEmptyArray(scope.threadIds)) {
    return;
  }

  const threadObjectMetadataId = await findThreadObjectMetadataId({
    manager,
    workspaceId,
  });

  if (!isDefined(threadObjectMetadataId)) {
    return;
  }

  const schema = getWorkspaceSchemaName(workspaceId);
  const scopeConditions = buildScopeConditions(scope);
  const channelRuleGrantsQuery = manager
    .createQueryBuilder()
    .select('thread.id', 'recordId')
    .addSelect('role.id', 'principalId')
    .addSelect('thread."channelId"', 'sourceId')
    .from(`${schema}.agentChatThread`, 'thread')
    .innerJoin(
      AgentChatChannelEntity,
      'channel',
      'channel.id = thread."channelId" AND channel."workspaceId" = :workspaceId',
    )
    .innerJoin(RoleEntity, 'role', 'role."workspaceId" = :workspaceId')
    .leftJoin(
      AgentChatChannelRoleEntity,
      'channel_role',
      'channel_role."workspaceId" = :workspaceId AND channel_role."channelId" = thread."channelId" AND channel_role."roleId" = role.id',
    )
    .where(scopeConditions.thread, scopeConditions.parameters)
    .andWhere(ROLE_CAN_ACCESS_THREAD_CHANNEL)
    .setParameter('workspaceId', workspaceId);

  await deleteObsoleteChannelRuleGrants({
    manager,
    schema,
    threadObjectMetadataId,
    recordShareScopeCondition: scopeConditions.recordShare,
    channelRuleGrantsQuery,
  });

  await insertChannelRuleGrants({
    manager,
    schema,
    threadObjectMetadataId,
    channelRuleGrantsQuery,
  });
};
