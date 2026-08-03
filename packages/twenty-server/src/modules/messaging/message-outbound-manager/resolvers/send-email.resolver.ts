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
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { SendEmailOutputDTO } from 'src/modules/messaging/message-outbound-manager/dtos/send-email-output.dto';
import { SendEmailInput } from 'src/modules/messaging/message-outbound-manager/dtos/send-email.input';
import {
  SaveMassEmailCampaignDraftInput,
  SendMassEmailCampaignInput,
} from 'src/modules/messaging/message-outbound-manager/dtos/mass-email-campaign.input';
import { SendMassEmailCampaignOutputDTO } from 'src/modules/messaging/message-outbound-manager/dtos/mass-email-campaign-output.dto';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';
import { SaveMessageCampaignDraftOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/save-message-campaign-draft-output.dto';
import {
  type MassEmailCampaignSendOutcome,
  MessageCampaignService,
} from 'src/modules/emailing/services/message-campaign.service';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SEND_EMAIL_TOOL),
)
export class SendEmailResolver {
  private readonly logger = new Logger(SendEmailResolver.name);

  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly emailComposerService: EmailComposerService,
    private readonly fileEmailAttachmentService: FileEmailAttachmentService,
    private readonly sendEmailService: SendEmailService,
    private readonly messageCampaignService: MessageCampaignService,
  ) {}

  @Mutation(() => SaveMessageCampaignDraftOutputDTO)
  async saveMassEmailCampaignDraft(
    @Args('input') input: SaveMassEmailCampaignDraftInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<SaveMessageCampaignDraftOutputDTO> {
    const connectedAccount =
      await this.connectedAccountMetadataService.verifyOwnership({
        id: input.connectedAccountId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });

    return this.messageCampaignService.saveMassEmailDraft({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
      campaignId: input.campaignId,
      personIds: input.personIds,
      subject: input.subject,
      body: input.body,
      fromAddress: connectedAccount.handle,
    });
  }

  @Mutation(() => SendMassEmailCampaignOutputDTO)
  async sendMassEmailCampaign(
    @Args('input') input: SendMassEmailCampaignInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<SendMassEmailCampaignOutputDTO> {
    const connectedAccount =
      await this.connectedAccountMetadataService.verifyOwnership({
        id: input.connectedAccountId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });

    await this.messageCampaignService.prepareMassEmailCampaignForSending({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceMemberId,
      campaignId: input.campaignId,
      recipients: input.emails.map(({ personId, to }) => ({
        personId,
        email: to,
      })),
      fromAddress: connectedAccount.handle,
    });

    const outcomes: MassEmailCampaignSendOutcome[] = [];

    for (const email of input.emails) {
      try {
        const composed = await this.emailComposerService.composeEmail(
          {
            recipients: { to: email.to, cc: '', bcc: '' },
            subject: email.subject,
            body: email.body,
            connectedAccountId: input.connectedAccountId,
            files: [],
          },
          { workspaceId: workspace.id },
        );

        if (!composed.success) {
          outcomes.push({ ...email, email: email.to, success: false });
          continue;
        }

        const sendResult = await this.sendEmailService.sendComposedEmail(
          composed.data,
        );
        const persistedMessage = composed.data.shouldPersistMessage
          ? await this.sendEmailService.persistSentMessage(
              sendResult,
              composed.data,
              workspace.id,
            )
          : undefined;

        outcomes.push({
          ...email,
          email: email.to,
          success: true,
          messageId: persistedMessage?.messageId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send campaign email to ${email.to}: ${error}`,
        );
        outcomes.push({ ...email, email: email.to, success: false });
      }
    }

    await this.messageCampaignService.finalizeMassEmailCampaign({
      workspaceId: workspace.id,
      campaignId: input.campaignId,
      workspaceMemberId,
      fromAddress: connectedAccount.handle,
      outcomes,
    });

    return {
      campaignId: input.campaignId,
      sentCount: outcomes.filter(({ success }) => success).length,
      failedRecipients: outcomes
        .filter(({ success }) => !success)
        .map(({ email }) => email),
    };
  }

  @Mutation(() => SendEmailOutputDTO)
  async sendEmail(
    @Args('input') input: SendEmailInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<SendEmailOutputDTO> {
    try {
      await this.connectedAccountMetadataService.verifyOwnership({
        id: input.connectedAccountId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });

      const result = await this.emailComposerService.composeEmail(
        {
          recipients: {
            to: input.to,
            cc: input.cc ?? '',
            bcc: input.bcc ?? '',
          },
          subject: input.subject,
          body: input.body,
          connectedAccountId: input.connectedAccountId,
          files: input.files ?? [],
          inReplyTo: input.inReplyTo,
        },
        { workspaceId: workspace.id },
      );

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
