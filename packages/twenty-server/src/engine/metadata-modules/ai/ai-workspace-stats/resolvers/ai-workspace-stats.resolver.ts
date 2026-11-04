import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAiStatsDTO } from 'src/engine/metadata-modules/ai/ai-workspace-stats/dtos/workspace-ai-stats.dto';
import { AiWorkspaceStatsService } from 'src/engine/metadata-modules/ai/ai-workspace-stats/services/ai-workspace-stats.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [PermissionFlagType.AI_SETTINGS],
  }),
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
