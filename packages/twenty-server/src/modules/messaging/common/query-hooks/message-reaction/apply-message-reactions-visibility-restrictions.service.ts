import { Injectable, type OnModuleInit } from '@nestjs/common';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageReactionWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-reaction.workspace-entity';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';

// A reaction is message content, so it follows the message's channel visibility like its text
@Injectable()
export class ApplyMessageReactionsVisibilityRestrictionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
    private readonly applyMessagesVisibilityRestrictionsService: ApplyMessagesVisibilityRestrictionsService,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler({
      objectNameSingular: 'messageReaction',
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
    const restrictableReactions = records.filter(
      (reaction) => 'emoji' in reaction,
    );

    if (restrictableReactions.length === 0) {
      return;
    }

    const messageIdByReactionId = await this.findMessageIds({
      reactions: restrictableReactions,
      workspaceId: authContext.workspace.id,
    });

    const { fullyVisibleMessageIds } =
      await this.applyMessagesVisibilityRestrictionsService.findVisibleMessageIds(
        {
          messageIds: [...messageIdByReactionId.values()],
          authContext,
        },
      );

    for (const reaction of restrictableReactions) {
      const messageId = messageIdByReactionId.get(reaction.id);

      if (isDefined(messageId) && fullyVisibleMessageIds.has(messageId)) {
        continue;
      }

      reaction.emoji = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
    }
  }

  private async findMessageIds({
    reactions,
    workspaceId,
  }: {
    reactions: ObjectRecord[];
    workspaceId: string;
  }): Promise<Map<string, string>> {
    const messageIdByReactionId = new Map<string, string>();
    const reactionIdsToLookUp: string[] = [];

    for (const reaction of reactions) {
      if (isNonEmptyString(reaction.messageId)) {
        messageIdByReactionId.set(reaction.id, reaction.messageId);
      } else {
        reactionIdsToLookUp.push(reaction.id);
      }
    }

    if (reactionIdsToLookUp.length === 0) {
      return messageIdByReactionId;
    }

    const storedReactions =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<MessageReactionWorkspaceEntity>(
              'messageReaction',
            )
            .find({
              where: { id: In(reactionIdsToLookUp) },
              select: { id: true, messageId: true },
              withDeleted: true,
            }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    for (const { id, messageId } of storedReactions) {
      messageIdByReactionId.set(id, messageId);
    }

    return messageIdByReactionId;
  }
}
