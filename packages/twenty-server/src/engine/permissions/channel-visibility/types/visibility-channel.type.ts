import { type ChannelVisibilityLevel } from 'src/engine/permissions/channel-visibility/types/channel-visibility-level.type';

export type VisibilityChannel = {
  id: string;
  ownerUserWorkspaceId: string | null;
  sharedLevel: ChannelVisibilityLevel;
};
