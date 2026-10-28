import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { McpServerDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server.dto';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  FeatureFlagGuard(FeatureFlagKey.IS_MCP_SERVERS_ENABLED),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@MetadataResolver(() => McpServerDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class McpServerMentionResolver {
  constructor(private readonly mcpServerService: McpServerService) {}

  @Query(() => [McpServerDTO])
  async activeMcpServers(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<McpServerDTO[]> {
    return await this.mcpServerService.findAllActive(workspace.id);
  }
}
