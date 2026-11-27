import { type ChannelWriteAccess } from 'src/engine/permissions/channel-visibility/types/channel-write-access.type';

export type TemporaryChannelWriteAccess = {
  objectMetadataIds: string[];
  adminRoleId?: string;
  apiKeysIndividualRoleId?: string;
  writeAccessByRoleId: Partial<Record<string, ChannelWriteAccess>>;
};
