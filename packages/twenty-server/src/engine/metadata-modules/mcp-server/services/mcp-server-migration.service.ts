import { Injectable } from '@nestjs/common';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type FlatEntityOperation<TFlatEntity> = Partial<{
  flatEntityToCreate: TFlatEntity[];
  flatEntityToUpdate: TFlatEntity[];
  flatEntityToDelete: TFlatEntity[];
}>;

// MCP servers and their sign-in providers change together, as the workspace custom application.
@Injectable()
export class McpServerMigrationService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async getFlatMaps(workspaceId: string): Promise<{
    flatMcpServerMaps: FlatEntityMaps<FlatMcpServer>;
    flatConnectionProviderMaps: FlatEntityMaps<FlatConnectionProvider>;
  }> {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: ['flatMcpServerMaps', 'flatConnectionProviderMaps'],
      },
    );
  }

  async getFlatMcpServerMaps(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatMcpServer>> {
    const { flatMcpServerMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );

    return flatMcpServerMaps;
  }

  async runOrThrow({
    mcpServerOperation = {},
    connectionProviderOperation = {},
    workspaceId,
    errorMessage,
  }: {
    mcpServerOperation?: FlatEntityOperation<FlatMcpServer>;
    connectionProviderOperation?: FlatEntityOperation<FlatConnectionProvider>;
    workspaceId: string;
    errorMessage: string;
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            mcpServer: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: [],
              ...mcpServerOperation,
            },
            connectionProvider: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: [],
              ...connectionProviderOperation,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        errorMessage,
      );
    }
  }
}
