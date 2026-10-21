import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { getTargetFieldNameForObjectRecord } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type MessageThreadTargetWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread-target.workspace-entity';

@Injectable()
export class SentMessageRecordLinkService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly permissionsService: PermissionsService,
  ) {}

  async linkSentMessageThreadToRecord({
    workspaceId,
    userWorkspaceId,
    messageThreadId,
    objectNameSingular,
    recordId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    messageThreadId: string;
    objectNameSingular: string;
    recordId: string;
  }): Promise<void> {
    const targetFieldName =
      getTargetFieldNameForObjectRecord(objectNameSingular);

    if (!isDefined(targetFieldName)) {
      return;
    }

    const { objectsPermissions } =
      await this.permissionsService.getUserWorkspacePermissions({
        workspaceId,
        userWorkspaceId,
      });

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const targetObjectMetadataId =
        getWorkspaceContext().objectIdByNameSingular[objectNameSingular];

      // messageThreadTarget is a system object that skips role checks, so the caller's role is checked on the record
      if (
        !isDefined(targetObjectMetadataId) ||
        objectsPermissions[targetObjectMetadataId]?.canUpdateObjectRecords !==
          true
      ) {
        return;
      }

      const targetRecordRepository = this.workspaceOrmManager.getRepository(
        objectNameSingular,
        { shouldBypassPermissionChecks: true },
      );

      if (!(await targetRecordRepository.exists({ where: { id: recordId } }))) {
        return;
      }

      const messageThreadTargetRepository =
        this.workspaceOrmManager.getRepository<MessageThreadTargetWorkspaceEntity>(
          'messageThreadTarget',
          { shouldBypassPermissionChecks: true },
        );

      const existingMessageThreadTarget =
        await messageThreadTargetRepository.findOne({
          where: { messageThreadId, [targetFieldName]: recordId },
        });

      if (isDefined(existingMessageThreadTarget)) {
        if (!existingMessageThreadTarget.isManuallyAssigned) {
          await messageThreadTargetRepository.update(
            existingMessageThreadTarget.id,
            { isManuallyAssigned: true },
          );
        }

        return;
      }

      await messageThreadTargetRepository.insert({
        messageThreadId,
        [targetFieldName]: recordId,
        isAutomaticallyAssigned: false,
        isManuallyAssigned: true,
      });
    }, buildSystemAuthContext(workspaceId));
  }
}
