import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { CreateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/create-mcp-server.input';
import { McpServerDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server.dto';
import { UpdateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/update-mcp-server.input';
import { McpServerGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/mcp-server/interceptors/mcp-server-graphql-api-exception.interceptor';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

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
  FeatureFlagGuard(FeatureFlagKey.IS_MCP_SERVERS_ENABLED),
  SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  McpServerGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => McpServerDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class McpServerResolver {
  constructor(private readonly mcpServerService: McpServerService) {}

  @Query(() => [McpServerDTO])
  async mcpServers(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<McpServerDTO[]> {
    return await this.mcpServerService.findAll(workspace.id);
  }

  @Query(() => McpServerDTO, { nullable: true })
  async mcpServer(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<McpServerDTO | null> {
    return await this.mcpServerService.findById(id, workspace.id);
  }

  @Mutation(() => McpServerDTO)
  async createMcpServer(
    @Args('input') input: CreateMcpServerInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<McpServerDTO> {
    return await this.mcpServerService.create(input, workspace.id);
  }

  @Mutation(() => McpServerDTO)
  async updateMcpServer(
    @Args('input') input: UpdateMcpServerInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<McpServerDTO> {
    return await this.mcpServerService.update(input, workspace.id);
  }

  @Mutation(() => McpServerDTO)
  async deleteMcpServer(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<McpServerDTO> {
    return await this.mcpServerService.delete(id, workspace.id);
  }
}
