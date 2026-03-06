import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';
import { WebhookDTO } from 'src/engine/metadata-modules/webhook/dtos/webhook.dto';
import { WebhookGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/webhook/interceptors/webhook-graphql-api-exception.interceptor';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  WebhookGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => WebhookDTO)
export class WebhookResolver {
  constructor(private readonly webhookService: WebhookService) {}

  @Query(() => [WebhookDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS))
  async webhooks(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO[]> {
    return await this.webhookService.findAll(workspace.id);
  }

  @Query(() => WebhookDTO, { nullable: true })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS))
  async webhook(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO | null> {
    return await this.webhookService.findById(id, workspace.id);
  }

  @Mutation(() => WebhookDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS))
  async createWebhook(
    @Args('input') input: CreateWebhookInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO> {
    return await this.webhookService.create(input, workspace.id);
  }

  @Mutation(() => WebhookDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS))
  async updateWebhook(
    @Args('input') input: UpdateWebhookInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO> {
    return await this.webhookService.update(input, workspace.id);
  }

  @Mutation(() => WebhookDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS))
  async deleteWebhook(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO> {
    return await this.webhookService.delete(id, workspace.id);
  }
}
