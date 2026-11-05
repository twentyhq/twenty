import { Injectable, type OnModuleInit } from '@nestjs/common';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';

const RESTRICTED_ATTACHMENT_FIELD_NAMES = ['name', 'fullPath', 'file'];

// Message files are readable from the attachment object too, so they follow the message's channel visibility here as well
@Injectable()
export class ApplyAttachmentsVisibilityRestrictionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
    private readonly applyMessagesVisibilityRestrictionsService: ApplyMessagesVisibilityRestrictionsService,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler({
      objectNameSingular: 'attachment',
      handler: this,
    });
  }

  public async applyVisibilityRestrictions({
    records,
    authContext,
  }: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
  }): Promise<void> {
    const restrictableAttachments = records.filter((attachment) =>
      RESTRICTED_ATTACHMENT_FIELD_NAMES.some(
        (fieldName) => fieldName in attachment,
      ),
    );

    if (restrictableAttachments.length === 0) {
      return;
    }

    const targetMessageIdByAttachmentId = await this.findTargetMessageIds({
      attachments: restrictableAttachments,
      workspaceId: authContext.workspace.id,
    });

    if (targetMessageIdByAttachmentId.size === 0) {
      return;
    }

    const { fullyVisibleMessageIds } =
      await this.applyMessagesVisibilityRestrictionsService.findVisibleMessageIds(
        {
          messageIds: [...targetMessageIdByAttachmentId.values()],
          authContext,
        },
      );

    for (const attachment of restrictableAttachments) {
      const targetMessageId = targetMessageIdByAttachmentId.get(attachment.id);

      if (
        !isDefined(targetMessageId) ||
        fullyVisibleMessageIds.has(targetMessageId)
      ) {
        continue;
      }

      if ('name' in attachment) {
        attachment.name = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
      }

      if ('fullPath' in attachment) {
        attachment.fullPath = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
      }

      if ('file' in attachment) {
        attachment.file = [];
      }
    }
  }

  private async findTargetMessageIds({
    attachments,
    workspaceId,
  }: {
    attachments: ObjectRecord[];
    workspaceId: string;
  }): Promise<Map<string, string>> {
    const targetMessageIdByAttachmentId = new Map<string, string>();
    const attachmentIdsToLookUp: string[] = [];

    for (const attachment of attachments) {
      if (!('targetMessageId' in attachment)) {
        attachmentIdsToLookUp.push(attachment.id);
      } else if (isDefined(attachment.targetMessageId)) {
        targetMessageIdByAttachmentId.set(
          attachment.id,
          attachment.targetMessageId,
        );
      }
    }

    if (attachmentIdsToLookUp.length === 0) {
      return targetMessageIdByAttachmentId;
    }

    const storedAttachments =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<AttachmentWorkspaceEntity>(
              'attachment',
            )
            .find({
              where: {
                id: In(attachmentIdsToLookUp),
                targetMessageId: Not(IsNull()),
              },
              select: { id: true, targetMessageId: true },
              withDeleted: true,
            }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    for (const { id, targetMessageId } of storedAttachments) {
      if (isDefined(targetMessageId)) {
        targetMessageIdByAttachmentId.set(id, targetMessageId);
      }
    }

    return targetMessageIdByAttachmentId;
  }
}
