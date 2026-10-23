import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getTargetFieldNameForObjectRecord } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { RecordPermissionsService } from 'src/engine/metadata-modules/record-permissions/services/record-permissions.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type MessageThreadTargetWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread-target.workspace-entity';

@Injectable()
export class SentMessageRecordLinkService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  async linkSentMessageThreadToRecord({
    authContext,
    messageThreadId,
    objectNameSingular,
    recordId,
  }: {
    authContext: WorkspaceAuthContext;
    messageThreadId: string;
    objectNameSingular: string;
    recordId: string;
  }): Promise<void> {
    const targetFieldName =
      getTargetFieldNameForObjectRecord(objectNameSingular);

    if (!isDefined(targetFieldName)) {
      return;
    }

    // The link is written in a system context, so the caller's own access to this record, row-level rules included, gates it
    const permissionsByRecordId =
      await this.recordPermissionsService.getPermissionsForRecords({
        authContext,
        flatObjectMetadata: { nameSingular: objectNameSingular },
        recordIds: [recordId],
      });

    if (!permissionsByRecordId.get(recordId)?.canUpdate) {
      return;
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
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
    }, buildSystemAuthContext(authContext.workspace.id));
  }
}
