import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class McpServerMigrationService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async getFlatMaps(workspaceId: string) {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: ['flatMcpServerMaps', 'flatConnectionProviderMaps'],
      },
    );
  }

  async getFlatMcpServerMaps(workspaceId: string) {
    const { flatMcpServerMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );

    return flatMcpServerMaps;
  }

  // Unknown ids pass through so the validator reports them instead of a lookup throwing first.
  async resolveConnectionProviderUniversalIdentifier({
    connectionProviderId,
    workspaceId,
  }: {
    connectionProviderId: string | null | undefined;
    workspaceId: string;
  }): Promise<string | null> {
    if (!isDefined(connectionProviderId)) {
      return null;
    }

    const { flatConnectionProviderMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatConnectionProviderMaps'] },
      );

    return (
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: connectionProviderId,
        flatEntityMaps: flatConnectionProviderMaps,
      })?.universalIdentifier ?? connectionProviderId
    );
  }

  async runMigrationOrThrow({
    mcpServerOperation = {},
    connectionProviderOperation = {},
    workspaceId,
    errorMessage,
  }: {
    mcpServerOperation?: Partial<{
      flatEntityToCreate: FlatMcpServer[];
      flatEntityToUpdate: FlatMcpServer[];
      flatEntityToDelete: FlatMcpServer[];
    }>;
    connectionProviderOperation?: Partial<{
      flatEntityToCreate: FlatConnectionProvider[];
      flatEntityToDelete: FlatConnectionProvider[];
    }>;
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
