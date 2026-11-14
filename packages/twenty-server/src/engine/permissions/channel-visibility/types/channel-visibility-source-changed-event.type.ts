export type ChannelVisibilitySourceChangedEvent = {
  reason:
    | 'channelCreated'
    | 'channelVisibilityUpdated'
    | 'channelDeleted'
    | 'connectedAccountOwnershipTransferred'
    | 'connectedAccountDeleted';
};
