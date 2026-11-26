import { type ActorMetadata } from 'twenty-shared/types';

export type MessageChannelMessageAssociationFolderAssociation = {
  messageChannelMessageAssociationId: string;
  messageFolderIds: string[];
  createdBy?: ActorMetadata;
};
