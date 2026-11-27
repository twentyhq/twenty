import { type ChannelWriteAccess } from 'src/engine/permissions/channel-visibility/types/channel-write-access.type';

// TODO(@charlesBochet): remove after 2026-12-27. Temporary channel write access for admins and API keys, only to unblock customers who reported broken links, merges and deletes
export type TemporaryChannelWriteAccess = {
  objectMetadataIds: string[];
  adminRoleId: string;
  adminWriteAccess: ChannelWriteAccess;
  isRestoredForAdminMembers: boolean;
  apiKeysIndividualRoleId?: string;
};
