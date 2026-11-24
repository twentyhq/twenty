import { type ChannelAssociationSource } from 'src/modules/connected-account/dynamic-fields/types/channel-association-source.type';

export type ChannelAssociationDynamicFieldContext = {
  channelAssociationSources: ChannelAssociationSource[];
  channelAssociationSourceByChannelId: Map<string, ChannelAssociationSource>;
};
