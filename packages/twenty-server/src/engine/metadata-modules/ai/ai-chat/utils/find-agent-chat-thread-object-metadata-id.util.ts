import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const findAgentChatThreadObjectMetadataId = async ({
  manager,
  workspaceId,
}: {
  manager: Pick<EntityManager, 'getRepository'>;
  workspaceId: string;
}): Promise<string | undefined> => {
  const objectMetadataRepository = manager.getRepository(ObjectMetadataEntity);
  const threadObjectMetadata = await objectMetadataRepository.findOne({
    select: { id: true },
    where: {
      workspaceId,
      universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    },
  });

  return threadObjectMetadata?.id;
};
