import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const findAgentChatThreadObjectMetadataId = async ({
  manager,
  workspaceId,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
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
