import { Injectable } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import {
  getUrlSafely,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { fromCreateMcpServerInputToFlatMcpServerToCreate } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-create-mcp-server-input-to-flat-mcp-server-to-create.util';
import { findFlatMcpServerByIdOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/find-flat-mcp-server-by-id-or-throw.util';
import { fromFlatMcpServerToMcpServerDto } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-flat-mcp-server-to-mcp-server-dto.util';
import { fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-update-mcp-server-input-to-flat-mcp-server-to-update-or-throw.util';
import { type CreateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/create-mcp-server.input';
import { type McpServerDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server.dto';
import { type UpdateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/update-mcp-server.input';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class McpServerService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findAll(workspaceId: string): Promise<McpServerDTO[]> {
    const flatMcpServerMaps = await this.getFlatMcpServerMaps(workspaceId);

    return Object.values(flatMcpServerMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort(
        (a, b) =>
          a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
      )
      .map(fromFlatMcpServerToMcpServerDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<McpServerDTO | null> {
    const flatMcpServer = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: await this.getFlatMcpServerMaps(workspaceId),
    });

    return isDefined(flatMcpServer)
      ? fromFlatMcpServerToMcpServerDto(flatMcpServer)
      : null;
  }

  async create(
    input: CreateMcpServerInput,
    workspaceId: string,
  ): Promise<McpServerDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatMcpServerToCreate =
      fromCreateMcpServerInputToFlatMcpServerToCreate({
        createMcpServerInput: { ...input, url: this.normalizeUrl(input.url) },
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        connectionProviderUniversalIdentifier:
          await this.resolveConnectionProviderUniversalIdentifier({
            connectionProviderId: input.connectionProviderId,
            workspaceId,
          }),
      });

    await this.runMigrationOrThrow({
      operation: { flatEntityToCreate: [flatMcpServerToCreate] },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while creating MCP server',
    });

    return fromFlatMcpServerToMcpServerDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatMcpServerToCreate.id,
        flatEntityMaps: await this.getFlatMcpServerMaps(workspaceId),
      }),
    );
  }

  async update(
    input: UpdateMcpServerInput,
    workspaceId: string,
  ): Promise<McpServerDTO> {
    const { name, label, url } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        input.update,
        ['name', 'label', 'url'],
      );
    const { connectionProviderId, isActive } = input.update;

    const connectionProviderUpdate = isUndefined(connectionProviderId)
      ? {}
      : {
          connectionProviderId,
          connectionProviderUniversalIdentifier:
            await this.resolveConnectionProviderUniversalIdentifier({
              connectionProviderId,
              workspaceId,
            }),
        };

    const flatMcpServerToUpdate =
      fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow({
        flatMcpServerMaps: await this.getFlatMcpServerMaps(workspaceId),
        mcpServerId: input.id,
        update: {
          ...(isDefined(name) && { name }),
          ...(isDefined(label) && { label }),
          ...(isDefined(url) && { url: this.normalizeUrl(url) }),
          ...(isDefined(isActive) && { isActive }),
          ...connectionProviderUpdate,
        },
      });

    await this.runMigrationOrThrow({
      operation: { flatEntityToUpdate: [flatMcpServerToUpdate] },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while updating MCP server',
    });

    return fromFlatMcpServerToMcpServerDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: await this.getFlatMcpServerMaps(workspaceId),
      }),
    );
  }

  async delete(id: string, workspaceId: string): Promise<McpServerDTO> {
    const flatMcpServerToDelete = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps: await this.getFlatMcpServerMaps(workspaceId),
      mcpServerId: id,
    });

    await this.runMigrationOrThrow({
      operation: { flatEntityToDelete: [flatMcpServerToDelete] },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while deleting MCP server',
    });

    return fromFlatMcpServerToMcpServerDto(flatMcpServerToDelete);
  }

  private normalizeUrl(url: string): string {
    return getUrlSafely(url)?.toString() ?? url;
  }

  // Unknown ids pass through so the validator reports them instead of a lookup throwing first.
  private async resolveConnectionProviderUniversalIdentifier({
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

  private async getFlatMcpServerMaps(workspaceId: string) {
    const { flatMcpServerMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );

    return flatMcpServerMaps;
  }

  private async runMigrationOrThrow({
    operation,
    workspaceId,
    errorMessage,
  }: {
    operation: Partial<{
      flatEntityToCreate: FlatMcpServer[];
      flatEntityToUpdate: FlatMcpServer[];
      flatEntityToDelete: FlatMcpServer[];
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
              ...operation,
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
