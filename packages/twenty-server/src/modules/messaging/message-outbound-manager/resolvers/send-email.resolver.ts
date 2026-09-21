import { ConnectedAccountOperation } from 'twenty-shared/types';
import {
  ForbiddenException,
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FileEmailAttachmentService } from 'src/engine/core-modules/file/file-email-attachment/services/file-email-attachment.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SendEmailOutputDTO } from 'src/modules/messaging/message-outbound-manager/dtos/send-email-output.dto';
import { SendEmailInput } from 'src/modules/messaging/message-outbound-manager/dtos/send-email.input';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SEND_EMAIL_TOOL),
)
export class SendEmailResolver {
  private readonly logger = new Logger(SendEmailResolver.name);

  constructor(
    private readonly emailComposerService: EmailComposerService,
    private readonly fileEmailAttachmentService: FileEmailAttachmentService,
    private readonly sendEmailService: SendEmailService,
  ) {}

  @Mutation(() => SendEmailOutputDTO)
  async sendEmail(
    @Args('input') input: SendEmailInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendEmailOutputDTO> {
    try {
      const result = await this.emailComposerService.composeEmail({
        parameters: {
          recipients: {
            to: input.to,
            cc: input.cc ?? '',
            bcc: input.bcc ?? '',
          },
          subject: input.subject,
          body: input.body,
          connectedAccountId: input.connectedAccountId,
          fromHandle: input.fromHandle,
          files: input.files ?? [],
          inReplyTo: input.inReplyTo,
        },
        context: {
          workspaceId: workspace.id,
          authContext: getWorkspaceAuthContext(),
        },
        operation: ConnectedAccountOperation.SEND_EMAIL,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.output.error ?? result.output.message,
        };
      }

      const { data } = result;

      const sendResult = isDefined(input.draftMessageId)
        ? await this.sendEmailService.sendComposedDraft(
            data,
            input.draftMessageId,
            workspace.id,
          )
        : await this.sendEmailService.sendComposedEmail(data);

      let messageThreadId: string | undefined;

      try {
        if (data.shouldPersistMessage) {
          await this.sendEmailService.persistSentMessage(
            sendResult,
            data,
            workspace.id,
          );
        }

        if (isDefined(input.draftMessageId)) {
          await this.sendEmailService.deleteSentDraft(
            input.draftMessageId,
            input.connectedAccountId,
            workspace.id,
          );
        }

        const sentMessageExternalId =
          sendResult.messageExternalId ?? sendResult.headerMessageId;

        messageThreadId =
          isDefined(input.draftMessageId) &&
          isNonEmptyString(sentMessageExternalId)
            ? await this.sendEmailService.getSentMessageThreadId(
                sentMessageExternalId,
                workspace.id,
              )
            : undefined;

        const attachmentFileIds = (input.files ?? []).map((file) => file.id);

        if (attachmentFileIds.length > 0) {
          await this.fileEmailAttachmentService.deleteFiles({
            fileIds: attachmentFileIds,
            workspaceId: workspace.id,
          });
        }
      } catch (postSendError) {
        this.logger.warn(
          `Email sent but post-send cleanup failed (sync will recover): ${postSendError}`,
        );
      }

      return { success: true, messageThreadId };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Failed to send email: ${error}`);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }
}
