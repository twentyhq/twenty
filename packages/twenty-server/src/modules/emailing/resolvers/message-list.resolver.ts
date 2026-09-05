import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DuplicatedMessageListDTO } from 'src/modules/emailing/dtos/duplicated-message-list.dto';
import { MessageListDuplicationService } from 'src/modules/emailing/services/message-list-duplication.service';
import { MessageListGraphqlApiExceptionFilter } from 'src/modules/emailing/utils/message-list-graphql-api-exception.filter';

// Object permissions are enforced by the service through the caller's role,
// so no settings permission is required here.
@MetadataResolver()
@UseFilters(MessageListGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class MessageListResolver {
  constructor(
    private readonly messageListDuplicationService: MessageListDuplicationService,
  ) {}

  @Mutation(() => DuplicatedMessageListDTO)
  @UseGuards(NoPermissionGuard)
  async duplicateMessageList(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<DuplicatedMessageListDTO> {
    const authContext = getWorkspaceAuthContext();

    return this.messageListDuplicationService.duplicateMessageList({
      messageListId: id,
      userWorkspaceId,
      authContext,
    });
  }
}
