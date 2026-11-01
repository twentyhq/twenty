import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { WEBHOOK_DELETE_ACCESS_POLICY } from 'src/engine/metadata-modules/webhook/constants/webhook-delete-access-policy.constant';
import { WEBHOOK_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/webhook/constants/webhook-read-access-policy.constant';
import { WEBHOOK_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/webhook/constants/webhook-write-access-policy.constant';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';
import { WebhookDTO } from 'src/engine/metadata-modules/webhook/dtos/webhook.dto';
import { WebhookGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/webhook/interceptors/webhook-graphql-api-exception.interceptor';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  WebhookGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => WebhookDTO)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
export class WebhookResolver {
  constructor(private readonly webhookService: WebhookService) {}

  @Query(() => [WebhookDTO])
  @UseGuards(AccessPolicyGuard(WEBHOOK_READ_ACCESS_POLICY))
  async webhooks(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO[]> {
    return await this.webhookService.findAll(workspace.id);
  }

  @Query(() => WebhookDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(WEBHOOK_READ_ACCESS_POLICY))
  async webhook(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO | null> {
    return await this.webhookService.findById(id, workspace.id);
  }

  @Mutation(() => WebhookDTO)
  @UseGuards(AccessPolicyGuard(WEBHOOK_WRITE_ACCESS_POLICY))
  async createWebhook(
    @Args('input') input: CreateWebhookInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO> {
    return await this.webhookService.create({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WebhookDTO)
  @UseGuards(AccessPolicyGuard(WEBHOOK_WRITE_ACCESS_POLICY))
  async updateWebhook(
    @Args('input') input: UpdateWebhookInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO> {
    return await this.webhookService.update({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WebhookDTO)
  @UseGuards(AccessPolicyGuard(WEBHOOK_DELETE_ACCESS_POLICY))
  async deleteWebhook(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookDTO> {
    return await this.webhookService.delete(id, workspace.id);
  }

  @ResolveField(() => RoleDTO, { nullable: true })
  async role(
    @Parent() webhook: WebhookDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RoleDTO | null> {
    return this.webhookService.findRoleByWebhookId({
      webhookId: webhook.id,
      workspaceId: workspace.id,
    });
  }
}
