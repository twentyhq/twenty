import { msg } from '@lingui/core/macro';

import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  type MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export const computePendingSyncActionForFolderUpdate = (
  messageFolderWithMessageChannel: Pick<
    MessageFolderWorkspaceEntity,
    'isSynced' | 'pendingSyncAction'
  > & {
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'syncStage'>;
  },
  isSyncEnabled: boolean,
): MessageFolderPendingSyncAction => {
  const { pendingSyncAction, messageChannel } = messageFolderWithMessageChannel;

  const isSyncOngoing =
    messageChannel.syncStage ===
    MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING;

  const hasPendingAction =
    pendingSyncAction !== MessageFolderPendingSyncAction.NONE;

  if (isSyncOngoing && hasPendingAction) {
    throw new WorkspaceQueryRunnerException(
      'Cannot update message folder while sync is ongoing with pending actions',
      WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      {
        userFriendlyMessage: msg`Cannot update message folder while sync is ongoing. Please wait for the sync to complete.`,
      },
    );
  }

  if (isSyncEnabled) {
    if (pendingSyncAction === MessageFolderPendingSyncAction.FOLDER_DELETION) {
      throw new WorkspaceQueryRunnerException(
        'Cannot enable sync while a folder deletion is pending',
        WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Cannot enable sync while folder deletion is in progress.`,
        },
      );
    }

    return MessageFolderPendingSyncAction.FOLDER_IMPORT;
  }

  if (pendingSyncAction === MessageFolderPendingSyncAction.FOLDER_IMPORT) {
    return MessageFolderPendingSyncAction.NONE;
  }

  return pendingSyncAction;
};
