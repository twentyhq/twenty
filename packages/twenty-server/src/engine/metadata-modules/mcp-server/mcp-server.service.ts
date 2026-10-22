import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
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
import { type UpdateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/update-mcp-server.input';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class McpServerService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  private encryptAuthorizationHeaderValue(
    value: string | null | undefined,
    workspaceId: string,
  ): EncryptedString | null {
    if (!isNonEmptyString(value)) {
      return null;
    }

    return this.secretEncryptionService.encryptVersioned(
      value as PlaintextString,
      { workspaceId },
    );
  }

  private normalizeUrl(url: string): string {
    try {
      return new URL(url).toString();
    } catch {
      return url;
    }
  }

  private async getFlatMcpServerMaps(workspaceId: string) {
    const { flatMcpServerMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );

    return flatMcpServerMaps;
  }

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
    const flatMcpServerMaps = await this.getFlatMcpServerMaps(workspaceId);

    const flatMcpServer = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatMcpServerMaps,
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
        encryptedAuthorizationHeaderValue: this.encryptAuthorizationHeaderValue(
          input.authorizationHeaderValue,
          workspaceId,
        ),
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
      });

    await this.runMigration({
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

    const { authorizationHeaderValue, url, ...otherUpdates } = input.update;

    const flatMcpServerToUpdate =
      fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow({
        flatMcpServerMaps: await this.getFlatMcpServerMaps(workspaceId),
        mcpServerId: input.id,
        update: {
          ...otherUpdates,
          ...(isDefined(url) && { url: this.normalizeUrl(url) }),
          ...(authorizationHeaderValue !== undefined && {
            authorizationHeaderValue: this.encryptAuthorizationHeaderValue(
              authorizationHeaderValue,
              workspaceId,
            ),
          }),
        },
      });

    await this.runMigration({
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

    await this.runMigration({
      operation: { flatEntityToDelete: [flatMcpServerToDelete] },
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      errorMessage:
        'Multiple validation errors occurred while deleting MCP server',
    });

    return fromFlatMcpServerToMcpServerDto(flatMcpServerToDelete);
  }

  private async runMigration({
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
