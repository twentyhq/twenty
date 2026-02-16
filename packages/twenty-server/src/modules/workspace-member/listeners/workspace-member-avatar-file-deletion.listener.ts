import { Injectable } from '@nestjs/common';

import {
  ObjectRecordDeleteEvent,
  ObjectRecordDestroyEvent,
  ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class WorkspaceMemberAvatarFileDeletionListener {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly fileCorePictureService: FileCorePictureService,
  ) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.UPDATED)
  async handleUpdate(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    if (
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CORE_PICTURE_MIGRATED,
        payload.workspaceId,
      ))
    ) {
      return;
    }

    const fileIdsToDelete = this.getFileIdsToDeleteFromUpdateEvent(payload);

    this.deleteCorePictures(fileIdsToDelete, payload.workspaceId);
  }

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  async handleDestroyOrDeleteEvent(
    payload: WorkspaceEventBatch<
      | ObjectRecordDestroyEvent<WorkspaceMemberWorkspaceEntity>
      | ObjectRecordDeleteEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    const fileIdsToDelete =
      this.getFileIdsToDeleteFromDestroyOrDeleteEvent(payload);

    await this.deleteCorePictures(fileIdsToDelete, payload.workspaceId);
  }

  private async deleteCorePictures(
    fileIds: string[],
    workspaceId: string,
  ): Promise<void> {
    for (const fileId of fileIds) {
      await this.fileCorePictureService.deleteCorePicture({
        workspaceId,
        fileId,
      });
    }
  }

  private getFileIdsToDeleteFromUpdateEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ): string[] {
    return payload.events
      .map((event) => {
        const beforeAvatarUrl = event.properties.before.avatarUrl;

        if (!isDefined(beforeAvatarUrl)) {
          return undefined;
        }

        const beforeFileId = extractFileIdFromUrl(
          beforeAvatarUrl,
          FileFolder.CorePicture,
        );
        const afterFileId = extractFileIdFromUrl(
          event.properties.after.avatarUrl ?? '',
          FileFolder.CorePicture,
        );

        return beforeFileId !== afterFileId ? beforeFileId : undefined;
      })
      .filter(isDefined);
  }

  private getFileIdsToDeleteFromDestroyOrDeleteEvent(
    payload:
      | WorkspaceEventBatch<
          ObjectRecordDestroyEvent<WorkspaceMemberWorkspaceEntity>
        >
      | WorkspaceEventBatch<
          ObjectRecordDeleteEvent<WorkspaceMemberWorkspaceEntity>
        >,
  ): string[] {
    return payload.events
      .map((event) =>
        isDefined(event.properties.before.avatarUrl)
          ? extractFileIdFromUrl(
              event.properties.before.avatarUrl,
              FileFolder.CorePicture,
            )
          : undefined,
      )
      .filter(isDefined);
  }
}
