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
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';
import { MarkAppChannelThreadAsReadInput } from 'src/engine/metadata-modules/message-channel/dtos/mark-app-channel-thread-as-read.input';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { ApplicationMessageReadService } from 'src/engine/metadata-modules/message-channel/services/application-message-read.service';
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
export class ApplicationMessageReadResolver {
  constructor(
    private readonly applicationMessageReadService: ApplicationMessageReadService,
  ) {}

  @Mutation(() => Boolean)
  async markAppChannelThreadAsRead(
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: MarkAppChannelThreadAsReadInput,
  ): Promise<boolean> {
    await this.applicationMessageReadService.markThreadAsRead({
      workspaceId: workspace.id,
      userWorkspaceId,
      messageChannelId: input.messageChannelId,
      messageThreadId: input.messageThreadId,
    });

    return true;
  }
}
