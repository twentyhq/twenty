import { isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

export const deleteObsoleteAgentChatChannelRuleGrants = async ({
  manager,
  recordShareTable,
  obsoleteGrantIds,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
  recordShareTable: string;
  obsoleteGrantIds: string[];
}): Promise<void> => {
  if (!isNonEmptyArray(obsoleteGrantIds)) {
    return;
  }

  await manager
    .createQueryBuilder()
    .delete()
    .from(recordShareTable)
    .where('id = ANY(:obsoleteGrantIds::uuid[])', { obsoleteGrantIds })
    .execute();
};
