import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CreateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/create-mcp-server.input';
import { McpServerDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server.dto';
import { UpdateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/update-mcp-server.input';
import { McpServerGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/mcp-server/interceptors/mcp-server-graphql-api-exception.interceptor';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const MCP_SERVER_AUTH_PRINCIPALS: AccessPolicy['authPrincipals'] = {
  userSession: {
    standard: true,
    impersonated: true,
    playground: true,
    workspaceAgnostic: false,
  },
  apiKey: true,
  oauthClient: true,
  application: true,
};

const MCP_SERVER_READ_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: MCP_SERVER_AUTH_PRINCIPALS,
  requiredPermissionFlags: [PermissionFlagType.WORKFLOWS],
  requiredFeatureFlags: [FeatureFlagKey.IS_MCP_SERVERS_ENABLED],
};

const MCP_SERVER_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: MCP_SERVER_AUTH_PRINCIPALS,
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
  requiredFeatureFlags: [FeatureFlagKey.IS_MCP_SERVERS_ENABLED],
};

@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  McpServerGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => McpServerDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class McpServerResolver {
  constructor(private readonly mcpServerService: McpServerService) {}

  @Query(() => [McpServerDTO])
  @UseGuards(AccessPolicyGuard(MCP_SERVER_READ_ACCESS_POLICY))
  async mcpServers(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<McpServerDTO[]> {
    const mcpServers = await this.mcpServerService.findAll(workspace.id);

    return mcpServers.filter((mcpServer) =>
      this.canCallerReachMcpServer({
        mcpServer,
        workspace,
        callingApplication,
      }),
    );
  }

  @Query(() => McpServerDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(MCP_SERVER_READ_ACCESS_POLICY))
  async mcpServer(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<McpServerDTO | null> {
    const mcpServer = await this.mcpServerService.findById(id, workspace.id);

    return isDefined(mcpServer) &&
      this.canCallerReachMcpServer({ mcpServer, workspace, callingApplication })
      ? mcpServer
      : null;
  }

  @Mutation(() => McpServerDTO)
  @UseGuards(AccessPolicyGuard(MCP_SERVER_WRITE_ACCESS_POLICY))
  async createMcpServer(
    @Args('input') input: CreateMcpServerInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<McpServerDTO> {
    return await this.mcpServerService.create(
      input,
      workspace.id,
      userWorkspaceId,
    );
  }

  @Mutation(() => McpServerDTO)
  @UseGuards(AccessPolicyGuard(MCP_SERVER_WRITE_ACCESS_POLICY))
  async updateMcpServer(
    @Args('input') input: UpdateMcpServerInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<McpServerDTO> {
    return await this.mcpServerService.update(
      input,
      workspace.id,
      userWorkspaceId,
    );
  }

  @Mutation(() => McpServerDTO)
  @UseGuards(AccessPolicyGuard(MCP_SERVER_WRITE_ACCESS_POLICY))
  async syncMcpServerTools(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<McpServerDTO> {
    return await this.mcpServerService.syncTools({
      id,
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => McpServerDTO)
  @UseGuards(AccessPolicyGuard(MCP_SERVER_WRITE_ACCESS_POLICY))
  async deleteMcpServer(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<McpServerDTO> {
    return await this.mcpServerService.delete(id, workspace.id);
  }

  // Workflow editors can only pick tools from servers their caller may trigger.
  private canCallerReachMcpServer({
    mcpServer,
    workspace,
    callingApplication,
  }: {
    mcpServer: McpServerDTO;
    workspace: WorkspaceEntity;
    callingApplication: FlatApplication | undefined;
  }): boolean {
    return canCallerReachApplication({
      callingApplication,
      applicationId: mcpServer.applicationId,
      operation: 'trigger',
      workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
    });
  }
}
