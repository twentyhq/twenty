import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  StreamableFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { PermissionFlagType } from 'twenty-shared/constants';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ChatwootReplyInput } from 'src/modules/enso/chatwoot/dtos/chatwoot-reply.input';
import { ChatwootAgentProvisioningService } from 'src/modules/enso/chatwoot/services/chatwoot-agent-provisioning.service';
import {
  type ChatwootRecordType,
  ChatwootMessagingService,
} from 'src/modules/enso/chatwoot/services/chatwoot-messaging.service';

type UploadedMulterFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

const toRecordType = (value: string | undefined): ChatwootRecordType =>
  value === 'person' ? 'person' : 'opportunity';

// Server side of the native in-CRM chat panel (Phase 5). All endpoints require a
// logged-in user and only touch conversations belonging to the given record (an
// opportunity or a person). Chatwoot is proxied with the account token server-side.
@Controller('rest/enso/chatwoot')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class ChatwootController {
  constructor(
    private readonly messagingService: ChatwootMessagingService,
    private readonly provisioningService: ChatwootAgentProvisioningService,
  ) {}

  @Get('conversations')
  @UseGuards(NoPermissionGuard)
  async conversations(
    @Query('recordType') recordType: string,
    @Query('recordId') recordId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const conversations = await this.messagingService.listConversations(
      workspace.id,
      toRecordType(recordType),
      recordId,
    );

    return { conversations };
  }

  @Get('messages')
  @UseGuards(NoPermissionGuard)
  async messages(
    @Query('recordType') recordType: string,
    @Query('recordId') recordId: string,
    @Query('conversationId') conversationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const thread = await this.messagingService.getThread(
      workspace.id,
      toRecordType(recordType),
      recordId,
      conversationId,
    );

    return thread;
  }

  // Does this record have any Chatwoot conversation? Drives tab visibility.
  @Get('has-conversation')
  @UseGuards(NoPermissionGuard)
  async hasConversation(
    @Query('recordType') recordType: string,
    @Query('recordId') recordId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const hasConversation = await this.messagingService.hasConversation(
      workspace.id,
      toRecordType(recordType),
      recordId,
    );

    return { hasConversation };
  }

  // Realtime credentials for the current user's Chatwoot agent (cable URL +
  // pubsub token) so the panel can subscribe to push instead of polling.
  @Get('realtime')
  @UseGuards(NoPermissionGuard)
  async realtime(@AuthUser() user: UserEntity) {
    const realtime = await this.messagingService.getRealtimeCredentials({
      email: user.email,
      name:
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
    });

    return { realtime };
  }

  @Get('canned-responses')
  @UseGuards(NoPermissionGuard)
  async cannedResponses() {
    const cannedResponses = await this.messagingService.listCannedResponses();

    return { cannedResponses };
  }

  // Stream an attachment (its Chatwoot URL needs the account token).
  @Get('attachment')
  @UseGuards(NoPermissionGuard)
  async attachment(
    @Query('recordType') recordType: string,
    @Query('recordId') recordId: string,
    @Query('conversationId') conversationId: string,
    @Query('url') url: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const { data, contentType } = await this.messagingService.fetchAttachment({
      workspaceId: workspace.id,
      recordType: toRecordType(recordType),
      recordId,
      conversationId,
      url,
    });

    return new StreamableFile(data, { type: contentType });
  }

  // Send a reply (with optional file/image attachments).
  @Post('reply')
  @UseGuards(NoPermissionGuard)
  @UseInterceptors(FilesInterceptor('attachments', 5))
  async reply(
    @Body() body: ChatwootReplyInput,
    @UploadedFiles() files: UploadedMulterFile[] | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
  ) {
    const attachments = (files ?? []).map((file) => ({
      buffer: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
    }));

    const message = await this.messagingService.sendReply({
      workspaceId: workspace.id,
      recordType: body.recordType,
      recordId: body.recordId,
      conversationId: body.conversationId,
      content: body.content,
      attachments: attachments.length > 0 ? attachments : undefined,
      userEmail: user.email,
      userName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
    });

    return { message };
  }

  // Admin: bulk-provision Chatwoot agents for all routing-eligible members.
  @Post('provision-agents')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKSPACE_MEMBERS))
  async provisionAgents(@AuthWorkspace() workspace: WorkspaceEntity) {
    const results = await this.provisioningService.provisionRoutingMembers(
      workspace.id,
    );

    return { results };
  }
}
