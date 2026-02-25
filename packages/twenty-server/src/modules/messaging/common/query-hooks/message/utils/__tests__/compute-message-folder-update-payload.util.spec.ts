import { WorkspaceQueryRunnerException } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { computePendingSyncActionForFolderUpdate } from 'src/modules/messaging/common/query-hooks/message/utils/compute-message-folder-update-payload.util';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

const buildFolder = (
  overrides: {
    isSynced?: boolean;
    pendingSyncAction?: MessageFolderPendingSyncAction;
    syncStage?: MessageChannelSyncStage;
  } = {},
) => ({
  isSynced: overrides.isSynced ?? false,
  pendingSyncAction:
    overrides.pendingSyncAction ?? MessageFolderPendingSyncAction.NONE,
  messageChannel: {
    syncStage:
      overrides.syncStage ?? MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
  },
});

describe('computePendingSyncActionForFolderUpdate', () => {
  it('should return FOLDER_IMPORT when enabling sync', () => {
    expect(computePendingSyncActionForFolderUpdate(buildFolder(), true)).toBe(
      MessageFolderPendingSyncAction.FOLDER_IMPORT,
    );
  });

  it('should throw when enabling with pending FOLDER_DELETION', () => {
    expect(() =>
      computePendingSyncActionForFolderUpdate(
        buildFolder({
          pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
        }),
        true,
      ),
    ).toThrow(WorkspaceQueryRunnerException);
  });

  it('should cancel pending FOLDER_IMPORT when disabling sync', () => {
    expect(
      computePendingSyncActionForFolderUpdate(
        buildFolder({
          isSynced: true,
          pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
        }),
        false,
      ),
    ).toBe(MessageFolderPendingSyncAction.NONE);
  });

  it('should return FOLDER_IMPORT idempotently when enabling with existing FOLDER_IMPORT', () => {
    expect(
      computePendingSyncActionForFolderUpdate(
        buildFolder({
          pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
        }),
        true,
      ),
    ).toBe(MessageFolderPendingSyncAction.FOLDER_IMPORT);
  });

  it('should preserve current pendingSyncAction when disabling with no pending import', () => {
    expect(
      computePendingSyncActionForFolderUpdate(
        buildFolder({ isSynced: true }),
        false,
      ),
    ).toBe(MessageFolderPendingSyncAction.NONE);
  });

  it('should preserve FOLDER_DELETION when disabling sync on a folder with pending deletion', () => {
    expect(
      computePendingSyncActionForFolderUpdate(
        buildFolder({
          isSynced: true,
          pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
        }),
        false,
      ),
    ).toBe(MessageFolderPendingSyncAction.FOLDER_DELETION);
  });

  it('should throw when toggling during ongoing sync with pending action', () => {
    expect(() =>
      computePendingSyncActionForFolderUpdate(
        buildFolder({
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
          pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
        }),
        true,
      ),
    ).toThrow(WorkspaceQueryRunnerException);

    expect(() =>
      computePendingSyncActionForFolderUpdate(
        buildFolder({
          isSynced: true,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
          pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
        }),
        false,
      ),
    ).toThrow(WorkspaceQueryRunnerException);
  });
});
