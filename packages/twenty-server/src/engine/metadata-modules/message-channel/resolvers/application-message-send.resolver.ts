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
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';
import { SendAppChannelMessageInput } from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.input';
import { SendAppChannelMessageOutput } from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.output';
import { StartAppChannelConversationInput } from 'src/engine/metadata-modules/message-channel/dtos/start-app-channel-conversation.input';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { ApplicationMessageSendService } from 'src/engine/metadata-modules/message-channel/services/application-message-send.service';
import { MessagingProviderGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/messaging-provider/interceptors/messaging-provider-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [PermissionFlagType.SEND_EMAIL_TOOL],
  }),
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
      email: input.email,
      idempotencyKey: input.idempotencyKey,
      attachments: input.attachments ?? [],
    });
  }

  @Mutation(() => SendAppChannelMessageOutput)
  async startAppChannelConversation(
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: StartAppChannelConversationInput,
  ): Promise<SendAppChannelMessageOutput> {
    return this.applicationMessageSendService.startConversation({
      workspaceId: workspace.id,
      userWorkspaceId,
      messageChannelId: input.messageChannelId,
      personId: input.personId,
      callerAuthContext: getWorkspaceAuthContext(),
      text: input.text,
      idempotencyKey: input.idempotencyKey,
    });
  }
}
