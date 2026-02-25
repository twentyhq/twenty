import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  MessageHtmlPreviewBatchDTO,
  MessageHtmlPreviewDTO,
} from 'src/modules/messaging/message-html-preview/dtos/message-html-preview.dto';
import {
  GetMessageHtmlPreviewArgs,
  GetMessageHtmlPreviewBatchArgs,
} from 'src/modules/messaging/message-html-preview/dtos/message-html-preview.input';
import { MessageHtmlPreviewService } from 'src/modules/messaging/message-html-preview/services/message-html-preview.service';

@UseGuards(WorkspaceAuthGuard, UserAuthGuard, CustomPermissionGuard)
@CoreResolver(() => MessageHtmlPreviewDTO)
export class MessageHtmlPreviewResolver {
  constructor(
    private readonly messageHtmlPreviewService: MessageHtmlPreviewService,
  ) {}

  @Query(() => MessageHtmlPreviewDTO)
  async getMessageHtmlPreview(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { messageId }: GetMessageHtmlPreviewArgs,
  ): Promise<MessageHtmlPreviewDTO> {
    const html = await this.messageHtmlPreviewService.getMessageHtml(
      messageId,
      workspace.id,
    );

    return { messageId, html };
  }

  @Query(() => MessageHtmlPreviewBatchDTO)
  async getMessageHtmlPreviewBatch(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { messageThreadIds }: GetMessageHtmlPreviewBatchArgs,
  ): Promise<MessageHtmlPreviewBatchDTO> {
    const previews = await this.messageHtmlPreviewService.getThreadMessagesHtml(
      messageThreadIds,
      workspace.id,
    );

    return { previews };
  }
}
