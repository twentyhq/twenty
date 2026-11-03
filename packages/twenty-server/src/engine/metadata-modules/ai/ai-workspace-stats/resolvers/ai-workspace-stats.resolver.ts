import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { WorkspaceAiStatsDTO } from 'src/engine/metadata-modules/ai/ai-workspace-stats/dtos/workspace-ai-stats.dto';
import { AiWorkspaceStatsService } from 'src/engine/metadata-modules/ai/ai-workspace-stats/services/ai-workspace-stats.service';

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
  SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS),
)
@MetadataResolver()
export class AiWorkspaceStatsResolver {
  constructor(
    private readonly aiWorkspaceStatsService: AiWorkspaceStatsService,
  ) {}

  @Query(() => WorkspaceAiStatsDTO)
  async findWorkspaceAiStats(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<WorkspaceAiStatsDTO> {
    return this.aiWorkspaceStatsService.computeStats(
      workspaceId,
      getWorkspaceAuthContext(),
    );
  }
}
