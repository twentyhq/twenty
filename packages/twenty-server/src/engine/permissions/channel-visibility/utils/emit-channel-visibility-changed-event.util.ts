import { CHANNEL_VISIBILITY_CHANGED_EVENT } from 'src/engine/permissions/channel-visibility/constants/channel-visibility-changed-event.constant';
import { type ChannelVisibilityChangedEvent } from 'src/engine/permissions/channel-visibility/types/channel-visibility-changed-event.type';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

export const emitChannelVisibilityChangedEvent = ({
  workspaceEventEmitter,
  workspaceId,
}: {
  workspaceEventEmitter: WorkspaceEventEmitter;
  workspaceId: string;
}): void => {
  workspaceEventEmitter.emitCustomBatchEvent<ChannelVisibilityChangedEvent>(
    CHANNEL_VISIBILITY_CHANGED_EVENT,
    [{}],
    workspaceId,
  );
};
