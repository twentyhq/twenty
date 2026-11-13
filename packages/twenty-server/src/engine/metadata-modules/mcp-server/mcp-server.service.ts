import { Injectable } from '@nestjs/common';

import {
  getUrlSafely,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { findFlatMcpServerByIdOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/find-flat-mcp-server-by-id-or-throw.util';
import { fromCreateMcpServerInputToFlatMcpServerToCreate } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-create-mcp-server-input-to-flat-mcp-server-to-create.util';
import { fromFlatMcpServerToMcpServerDto } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-flat-mcp-server-to-mcp-server-dto.util';
import { fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-update-mcp-server-input-to-flat-mcp-server-to-update-or-throw.util';
import { type CreateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/create-mcp-server.input';
import { type McpServerDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server.dto';
import { type UpdateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/update-mcp-server.input';
import { McpServerMigrationService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-migration.service';
import { McpServerSignInService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-sign-in.service';
import { McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { findMcpServerSignInFlatConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/find-mcp-server-sign-in-flat-connection-provider.util';

@Injectable()
export class McpServerService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly mcpServerMigrationService: McpServerMigrationService,
    private readonly mcpServerSignInService: McpServerSignInService,
    private readonly mcpServerToolSyncService: McpServerToolSyncService,
  ) {}

  async findAll(workspaceId: string): Promise<McpServerDTO[]> {
    const { flatMcpServerMaps, flatConnectionProviderMaps } =
      await this.mcpServerMigrationService.getFlatMaps(workspaceId);

    return Object.values(flatMcpServerMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort(
        (a, b) =>
          a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
      )
      .map((flatMcpServer) =>
        this.toMcpServerDto({ flatMcpServer, flatConnectionProviderMaps }),
      );
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<McpServerDTO | null> {
    const { flatMcpServerMaps, flatConnectionProviderMaps } =
      await this.mcpServerMigrationService.getFlatMaps(workspaceId);
    const flatMcpServer = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatMcpServerMaps,
    });

    return isDefined(flatMcpServer)
      ? this.toMcpServerDto({ flatMcpServer, flatConnectionProviderMaps })
      : null;
  }

  async create(
    input: CreateMcpServerInput,
    workspaceId: string,
    userWorkspaceId?: string,
  ): Promise<McpServerDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const url = this.normalizeUrl(input.url);
    const signInFlatConnectionProvider = isDefined(input.connectionProviderId)
      ? null
      : await this.mcpServerSignInService.buildSignInFlatConnectionProviderIfRequired(
          {
            mcpServer: {
              name: input.name,
              label: input.label,
              url,
              workspaceId,
            },
            flatApplication: workspaceCustomFlatApplication,
            scope: input.signInScope ?? 'USER',
          },
        );

    const flatMcpServerToCreate =
      fromCreateMcpServerInputToFlatMcpServerToCreate({
        createMcpServerInput: {
          ...input,
          url,
          connectionProviderId:
            signInFlatConnectionProvider?.id ?? input.connectionProviderId,
        },
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        connectionProviderUniversalIdentifier:
          signInFlatConnectionProvider?.universalIdentifier ??
          (await this.mcpServerMigrationService.resolveConnectionProviderUniversalIdentifier(
            {
              connectionProviderId: input.connectionProviderId,
              workspaceId,
            },
          )),
      });

    await this.mcpServerMigrationService.runMigrationOrThrow({
      mcpServerOperation: { flatEntityToCreate: [flatMcpServerToCreate] },
      connectionProviderOperation: {
        flatEntityToCreate: isDefined(signInFlatConnectionProvider)
          ? [signInFlatConnectionProvider]
          : [],
      },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while creating MCP server',
    });

    return this.syncTools({
      id: flatMcpServerToCreate.id,
      workspaceId,
      userWorkspaceId,
    });
  }

  async update(
    input: UpdateMcpServerInput,
    workspaceId: string,
    userWorkspaceId?: string,
  ): Promise<McpServerDTO> {
    const { name, label, url } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        input.update,
        ['name', 'label', 'url'],
      );
    const { connectionProviderId, isActive, signInScope } = input.update;

    const { flatMcpServerMaps, flatConnectionProviderMaps } =
      await this.mcpServerMigrationService.getFlatMaps(workspaceId);
    const existingFlatMcpServer = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps,
      mcpServerId: input.id,
    });
    const nextUrl = isDefined(url) ? this.normalizeUrl(url) : undefined;
    const {
      existingSignInFlatConnectionProvider,
      signInFlatConnectionProvider,
      connectionProviderUpdate,
    } = await this.mcpServerSignInService.computeConnectionProviderUpdate({
      existingFlatMcpServer,
      flatConnectionProviderMaps,
      nextUrl,
      connectionProviderId,
      signInScope,
      workspaceId,
    });

    const flatMcpServerToUpdate =
      fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow({
        flatMcpServerMaps,
        mcpServerId: input.id,
        update: {
          ...(isDefined(name) && { name }),
          ...(isDefined(label) && { label }),
          ...(isDefined(nextUrl) && { url: nextUrl }),
          ...(isDefined(isActive) && { isActive }),
          ...connectionProviderUpdate,
        },
      });

    await this.mcpServerMigrationService.runMigrationOrThrow({
      mcpServerOperation: { flatEntityToUpdate: [flatMcpServerToUpdate] },
      connectionProviderOperation: {
        flatEntityToCreate: isDefined(signInFlatConnectionProvider)
          ? [signInFlatConnectionProvider]
          : [],
      },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while updating MCP server',
    });

    if (
      isDefined(existingSignInFlatConnectionProvider) &&
      flatMcpServerToUpdate.connectionProviderId !==
        existingSignInFlatConnectionProvider.id
    ) {
      await this.mcpServerSignInService.deleteSignInFlatConnectionProviderIfUnused(
        {
          flatConnectionProvider: existingSignInFlatConnectionProvider,
          workspaceId,
        },
      );
    }

    const hasConnectionChanged =
      flatMcpServerToUpdate.url !== existingFlatMcpServer.url ||
      flatMcpServerToUpdate.connectionProviderId !==
        existingFlatMcpServer.connectionProviderId;

    if (hasConnectionChanged) {
      return this.syncTools({
        id: input.id,
        workspaceId,
        userWorkspaceId,
        shouldDiscardToolsOnFailure: true,
      });
    }

    return this.findByIdOrThrow({ id: input.id, workspaceId });
  }

  async syncTools({
    id,
    workspaceId,
    userWorkspaceId,
    shouldDiscardToolsOnFailure,
  }: {
    id: string;
    workspaceId: string;
    userWorkspaceId?: string;
    shouldDiscardToolsOnFailure?: boolean;
  }): Promise<McpServerDTO> {
    const flatMcpServer = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps:
        await this.mcpServerMigrationService.getFlatMcpServerMaps(workspaceId),
      mcpServerId: id,
    });

    await this.mcpServerToolSyncService.syncTools({
      ...flatMcpServer,
      userWorkspaceId,
      shouldDiscardToolsOnFailure,
    });

    const syncedMcpServer = await this.findByIdOrThrow({ id, workspaceId });

    // The sign-in check at creation can miss a server that was down or started asking later
    if (
      isDefined(syncedMcpServer.connectionProviderId) ||
      !isDefined(syncedMcpServer.toolsSyncError)
    ) {
      return syncedMcpServer;
    }

    const isSignInAttached =
      await this.mcpServerSignInService.attachSignInIfRequired({
        mcpServerId: id,
        workspaceId,
      });

    return isSignInAttached
      ? this.findByIdOrThrow({ id, workspaceId })
      : syncedMcpServer;
  }

  async delete(id: string, workspaceId: string): Promise<McpServerDTO> {
    const { flatMcpServerMaps, flatConnectionProviderMaps } =
      await this.mcpServerMigrationService.getFlatMaps(workspaceId);
    const flatMcpServerToDelete = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps,
      mcpServerId: id,
    });
    const signInFlatConnectionProvider =
      findMcpServerSignInFlatConnectionProvider({
        flatMcpServer: flatMcpServerToDelete,
        flatConnectionProviderMaps,
      });

    await this.mcpServerMigrationService.runMigrationOrThrow({
      mcpServerOperation: { flatEntityToDelete: [flatMcpServerToDelete] },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while deleting MCP server',
    });

    // Deleting a provider cascades to the servers still on it, so it goes once the server is gone.
    if (isDefined(signInFlatConnectionProvider)) {
      await this.mcpServerSignInService.deleteSignInFlatConnectionProviderIfUnused(
        {
          flatConnectionProvider: signInFlatConnectionProvider,
          workspaceId,
        },
      );
    }

    return {
      ...fromFlatMcpServerToMcpServerDto(flatMcpServerToDelete),
      signInScope: signInFlatConnectionProvider?.scope ?? null,
    };
  }

  private async findByIdOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<McpServerDTO> {
    const { flatMcpServerMaps, flatConnectionProviderMaps } =
      await this.mcpServerMigrationService.getFlatMaps(workspaceId);

    return this.toMcpServerDto({
      flatMcpServer: findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: flatMcpServerMaps,
      }),
      flatConnectionProviderMaps,
    });
  }

  private toMcpServerDto({
    flatMcpServer,
    flatConnectionProviderMaps,
  }: {
    flatMcpServer: FlatMcpServer;
    flatConnectionProviderMaps: FlatEntityMaps<FlatConnectionProvider>;
  }): McpServerDTO {
    return {
      ...fromFlatMcpServerToMcpServerDto(flatMcpServer),
      signInScope:
        findMcpServerSignInFlatConnectionProvider({
          flatMcpServer,
          flatConnectionProviderMaps,
        })?.scope ?? null,
    };
  }

  private normalizeUrl(url: string): string {
    return getUrlSafely(url)?.toString() ?? url;
  }
}
