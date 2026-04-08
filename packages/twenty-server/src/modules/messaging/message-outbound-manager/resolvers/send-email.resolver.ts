import {
  ForbiddenException,
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { SendEmailOutputDTO } from 'src/modules/messaging/message-outbound-manager/dtos/send-email-output.dto';
import { SendEmailInput } from 'src/modules/messaging/message-outbound-manager/dtos/send-email.input';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class SendEmailResolver {
  private readonly logger = new Logger(SendEmailResolver.name);

  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly emailComposerService: EmailComposerService,
    private readonly sendEmailService: SendEmailService,
  ) {}

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
          files: [],
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

      const sendResult = await this.sendEmailService.sendComposedEmail(data);

      await this.sendEmailService.persistSentMessage(
        sendResult,
        data,
        workspace.id,
      );

      return { success: true };
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
