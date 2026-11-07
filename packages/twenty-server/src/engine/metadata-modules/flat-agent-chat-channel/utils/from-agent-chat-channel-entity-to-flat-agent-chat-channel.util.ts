import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromAgentChatChannelEntityToFlatAgentChatChannel = (
  args: FromEntityToFlatEntityArgs<'agentChatChannel'>,
): FlatAgentChatChannel => {
  const { entity } = args;

  const scalarEntity = fromEntityToScalarEntity({
    metadataName: 'agentChatChannel',
    entity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'agentChatChannel',
      ...args,
    });

  return {
    ...scalarEntity,
    ...relationUniversalIdentifiers,
    channelRoleIds: entity.channelRoles.map(({ id }) => id),
    channelRoleUniversalIdentifiers: entity.channelRoles.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    navigationMenuItemIds: entity.navigationMenuItems.map(({ id }) => id),
    navigationMenuItemUniversalIdentifiers: entity.navigationMenuItems.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  };
};
