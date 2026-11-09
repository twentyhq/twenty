import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { McpServerToolTestResultDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server-tool-test-result.dto';
import { TestMcpServerToolInput } from 'src/engine/metadata-modules/mcp-server/dtos/test-mcp-server-tool.input';
import { McpServerGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/mcp-server/interceptors/mcp-server-graphql-api-exception.interceptor';
import { McpServerToolTestService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-test.service';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: { withUser: true, withoutUser: false },
      application: { withUser: true, withoutUser: false },
    },
    requiredPermissionFlags: [PermissionFlagType.WORKFLOWS],
    requiredFeatureFlags: [FeatureFlagKey.IS_MCP_SERVERS_ENABLED],
  }),
)
@UseInterceptors(McpServerGraphqlApiExceptionInterceptor)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class McpServerToolTestResolver {
  constructor(
    private readonly mcpServerToolTestService: McpServerToolTestService,
  ) {}

  @Mutation(() => McpServerToolTestResultDTO)
  async testMcpServerTool(
    @Args('input')
    { mcpServerId, toolName, toolArguments }: TestMcpServerToolInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<McpServerToolTestResultDTO> {
    return await this.mcpServerToolTestService.testTool({
      mcpServerId,
      toolName,
      toolArguments,
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }
}
