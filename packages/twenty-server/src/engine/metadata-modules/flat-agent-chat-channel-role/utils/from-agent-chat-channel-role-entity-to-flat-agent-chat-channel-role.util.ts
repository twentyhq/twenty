import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatAgentChatChannelRole } from 'src/engine/metadata-modules/flat-agent-chat-channel-role/types/flat-agent-chat-channel-role.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromAgentChatChannelRoleEntityToFlatAgentChatChannelRole = (
  args: FromEntityToFlatEntityArgs<'agentChatChannelRole'>,
): FlatAgentChatChannelRole => {
  const { entity } = args;

  const scalarEntity = fromEntityToScalarEntity({
    metadataName: 'agentChatChannelRole',
    entity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'agentChatChannelRole',
      ...args,
    });

  return {
    ...scalarEntity,
    ...relationUniversalIdentifiers,
  };
};
