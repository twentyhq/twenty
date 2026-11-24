import { type ChannelAssociationSource } from 'src/modules/connected-account/metadata-resolved-fields/types/channel-association-source.type';

export type ChannelAssociationMetadataResolvedFieldContext = {
  channelAssociationSources: ChannelAssociationSource[];
  channelAssociationSourceByChannelId: Map<string, ChannelAssociationSource>;
};
