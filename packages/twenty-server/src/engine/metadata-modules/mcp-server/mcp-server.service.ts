import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isUndefined } from '@sniptt/guards';
import {
  getUrlSafely,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { fromCreateMcpServerInputToFlatMcpServerToCreate } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-create-mcp-server-input-to-flat-mcp-server-to-create.util';
import { fromDeleteMcpServerInputToFlatMcpServerOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-delete-mcp-server-input-to-flat-mcp-server-or-throw.util';
import { fromFlatMcpServerToMcpServerDto } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-flat-mcp-server-to-mcp-server-dto.util';
import { fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-update-mcp-server-input-to-flat-mcp-server-to-update-or-throw.util';
import { type CreateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/create-mcp-server.input';
import { type McpServerDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server.dto';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { type UpdateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/update-mcp-server.input';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class McpServerService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
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

    await this.assertConnectedAccountBelongsToWorkspaceOrThrow({
      connectedAccountId: input.connectedAccountId,
      workspaceId,
    });

    const flatMcpServerToCreate =
      fromCreateMcpServerInputToFlatMcpServerToCreate({
        createMcpServerInput: { ...input, url: this.normalizeUrl(input.url) },
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
      });

    await this.runMigrationOrThrow({
      operation: { flatEntityToCreate: [flatMcpServerToCreate] },
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { name, label, url } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        input.update,
        ['name', 'label', 'url'],
      );
    const { connectedAccountId, isActive } = input.update;

    await this.assertConnectedAccountBelongsToWorkspaceOrThrow({
      connectedAccountId,
      workspaceId,
    });

    const flatMcpServerToUpdate =
      fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow({
        flatMcpServerMaps: await this.getFlatMcpServerMaps(workspaceId),
        mcpServerId: input.id,
        update: {
          ...(isDefined(name) && { name }),
          ...(isDefined(label) && { label }),
          ...(isDefined(url) && { url: this.normalizeUrl(url) }),
          ...(isDefined(isActive) && { isActive }),
          ...(!isUndefined(connectedAccountId) && { connectedAccountId }),
        },
      });

    await this.runMigrationOrThrow({
      operation: { flatEntityToUpdate: [flatMcpServerToUpdate] },
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatMcpServerToDelete =
      fromDeleteMcpServerInputToFlatMcpServerOrThrow({
        flatMcpServerMaps: await this.getFlatMcpServerMaps(workspaceId),
        mcpServerId: id,
      });

    await this.runMigrationOrThrow({
      operation: { flatEntityToDelete: [flatMcpServerToDelete] },
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      errorMessage:
        'Multiple validation errors occurred while deleting MCP server',
    });

    return fromFlatMcpServerToMcpServerDto(flatMcpServerToDelete);
  }

  private normalizeUrl(url: string): string {
    return getUrlSafely(url)?.toString() ?? url;
  }

  private async assertConnectedAccountBelongsToWorkspaceOrThrow({
    connectedAccountId,
    workspaceId,
  }: {
    connectedAccountId: string | null | undefined;
    workspaceId: string;
  }): Promise<void> {
    if (!isDefined(connectedAccountId)) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: connectedAccountId, workspaceId },
      select: { id: true },
    });

    if (!isDefined(connectedAccount)) {
      throw new McpServerException(
        `Connected account ${connectedAccountId} not found in workspace`,
        McpServerExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }
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
    applicationUniversalIdentifier,
    errorMessage,
  }: {
    operation: Partial<{
      flatEntityToCreate: FlatMcpServer[];
      flatEntityToUpdate: FlatMcpServer[];
      flatEntityToDelete: FlatMcpServer[];
    }>;
    workspaceId: string;
    applicationUniversalIdentifier: string;
    errorMessage: string;
  }): Promise<void> {
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
          applicationUniversalIdentifier,
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
