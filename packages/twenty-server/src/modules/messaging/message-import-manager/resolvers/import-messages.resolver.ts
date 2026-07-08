import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ImportMessagesOutputDTO } from 'src/modules/messaging/message-import-manager/dtos/import-messages-output.dto';
import { ImportMessagesInput } from 'src/modules/messaging/message-import-manager/dtos/import-messages.input';
import { MessagingImportMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-import-messages.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SEND_EMAIL_TOOL),
)
export class ImportMessagesResolver {
  private readonly logger = new Logger(ImportMessagesResolver.name);

  constructor(
    private readonly messagingImportMessagesService: MessagingImportMessagesService,
  ) {}

  @Mutation(() => ImportMessagesOutputDTO)
  async importMessages(
    @Args('input') input: ImportMessagesInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ImportMessagesOutputDTO> {
    try {
      const importedMessages =
        await this.messagingImportMessagesService.importMessages({
          input,
          workspaceId: workspace.id,
        });

      return { success: true, importedMessages };
    } catch (error) {
      this.logger.error(`Failed to import messages: ${error}`);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to import messages',
      };
    }
  }
}
