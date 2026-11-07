import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { McpServerConnectionDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server-connection.dto';
import { McpServerGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/mcp-server/interceptors/mcp-server-graphql-api-exception.interceptor';
import { McpServerConnectionService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-connection.service';

// A member connects their own account, so this needs no settings permission.
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: false,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [],
    requiredFeatureFlags: [FeatureFlagKey.IS_MCP_SERVERS_ENABLED],
  }),
)
@UseInterceptors(McpServerGraphqlApiExceptionInterceptor)
@MetadataResolver(() => McpServerConnectionDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class McpServerConnectionResolver {
  constructor(
    private readonly mcpServerConnectionService: McpServerConnectionService,
  ) {}

  @Query(() => [McpServerConnectionDTO])
  async mcpServerConnections(
    @Args('mcpServerId', { type: () => UUIDScalarType }) mcpServerId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<McpServerConnectionDTO[]> {
    return this.mcpServerConnectionService.findConnectionsVisibleToCaller({
      mcpServerId,
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => McpServerConnectionDTO)
  async deleteMcpServerConnection(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<McpServerConnectionDTO> {
    return this.mcpServerConnectionService.deleteConnection({
      id,
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }
}
