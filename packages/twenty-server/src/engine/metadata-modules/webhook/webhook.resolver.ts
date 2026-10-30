import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';
import { WebhookDTO } from 'src/engine/metadata-modules/webhook/dtos/webhook.dto';
import { WebhookGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/webhook/interceptors/webhook-graphql-api-exception.interceptor';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  WebhookGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => WebhookDTO)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
export class WebhookResolver {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly permissionsService: PermissionsService,
  ) {}

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
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
  ): Promise<WebhookDTO> {
    if (input.roleId !== undefined) {
      await this.assertCanAssignRoleOrThrow({
        workspaceId: workspace.id,
        userWorkspaceId,
        apiKeyId: apiKey?.id,
        applicationId: application?.id,
      });
    }

    return await this.webhookService.create(input, workspace.id);
  }

  @Mutation(() => WebhookDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS))
  async updateWebhook(
    @Args('input') input: UpdateWebhookInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
  ): Promise<WebhookDTO> {
    if (input.update.roleId !== undefined) {
      await this.assertCanAssignRoleOrThrow({
        workspaceId: workspace.id,
        userWorkspaceId,
        apiKeyId: apiKey?.id,
        applicationId: application?.id,
      });
    }

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

  // Binding a role to a webhook requires ROLES to prevent privilege escalation.
  private async assertCanAssignRoleOrThrow({
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    applicationId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    apiKeyId: string | undefined;
    applicationId: string | undefined;
  }): Promise<void> {
    const canAssignRole =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId,
        userWorkspaceId,
        setting: PermissionFlagType.ROLES,
        apiKeyId,
        applicationId,
        agentId: undefined,
      });

    if (!canAssignRole) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You need the Roles permission to assign a role to a webhook.`,
        },
      );
    }
  }
}
