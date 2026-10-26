import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';
import { SendAppChannelMessageInput } from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.input';
import { SendAppChannelMessageOutput } from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.output';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { ApplicationMessageSendService } from 'src/engine/metadata-modules/message-channel/services/application-message-send.service';
import { MessagingProviderGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/messaging-provider/interceptors/messaging-provider-graphql-api-exception.interceptor';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  SettingsPermissionGuard(PermissionFlagType.SEND_EMAIL_TOOL),
)
@UseInterceptors(
  MessageChannelGraphqlApiExceptionInterceptor,
  ConnectedAccountGraphqlApiExceptionInterceptor,
  MessagingProviderGraphqlApiExceptionInterceptor,
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter, UsageLimitGraphqlApiExceptionFilter)
export class ApplicationMessageSendResolver {
  constructor(
    private readonly applicationMessageSendService: ApplicationMessageSendService,
  ) {}

  @Mutation(() => SendAppChannelMessageOutput)
  async sendAppChannelMessage(
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: SendAppChannelMessageInput,
  ): Promise<SendAppChannelMessageOutput> {
    return this.applicationMessageSendService.send({
      workspaceId: workspace.id,
      userWorkspaceId,
      messageChannelId: input.messageChannelId,
      messageThreadId: input.messageThreadId,
      text: input.text,
      idempotencyKey: input.idempotencyKey,
    });
  }
}
