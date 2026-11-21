import { type ChannelVisibilityLevel } from 'src/engine/permissions/channel-visibility/types/channel-visibility-level.type';
import { type VisibilityChannel } from 'src/engine/permissions/channel-visibility/types/visibility-channel.type';

export const computeChannelIdsByVisibilityLevel = ({
  channels,
  userWorkspaceId,
}: {
  channels: VisibilityChannel[];
  userWorkspaceId: string;
}): Record<ChannelVisibilityLevel, string[]> => {
  const channelIdsByVisibilityLevel: Record<ChannelVisibilityLevel, string[]> =
    { full: [], subject: [], metadata: [] };

  for (const channel of channels) {
    const level =
      channel.ownerUserWorkspaceId === userWorkspaceId
        ? 'full'
        : channel.sharedLevel;

    channelIdsByVisibilityLevel[level].push(channel.id);
  }

  return channelIdsByVisibilityLevel;
};
