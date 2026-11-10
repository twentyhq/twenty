import { Injectable } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import { type ConnectionProviderScope } from 'twenty-shared/application';
import {
  getUrlSafely,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
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
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { buildMcpServerSignInFlatConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-flat-connection-provider.util';
import { isMcpServerSignInConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-server-sign-in-connection-provider.util';
import { type UpdateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/update-mcp-server.input';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class McpServerService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly mcpServerToolSyncService: McpServerToolSyncService,
    private readonly mcpServerClientService: McpServerClientService,
  ) {}

  async findAll(workspaceId: string): Promise<McpServerDTO[]> {
    const { flatMcpServerMaps, flatConnectionProviderMaps } =
      await this.getFlatMaps(workspaceId);

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
      await this.getFlatMaps(workspaceId);
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
    // Without a chosen provider, a server that asks for sign-in gets one of its own.
    const signInFlatConnectionProvider = isDefined(input.connectionProviderId)
      ? null
      : await this.buildSignInFlatConnectionProviderIfRequired({
          mcpServer: { name: input.name, label: input.label, url, workspaceId },
          flatApplication: workspaceCustomFlatApplication,
          scope: input.signInScope ?? 'USER',
        });

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
          (await this.resolveConnectionProviderUniversalIdentifier({
            connectionProviderId: input.connectionProviderId,
            workspaceId,
          })),
      });

    await this.runMigrationOrThrow({
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
      await this.getFlatMaps(workspaceId);
    const existingFlatMcpServer = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps,
      mcpServerId: input.id,
    });
    const nextUrl = isDefined(url) ? this.normalizeUrl(url) : undefined;
    const existingSignInFlatConnectionProvider =
      this.findSignInFlatConnectionProvider({
        flatMcpServer: existingFlatMcpServer,
        flatConnectionProviderMaps,
      });

    const isUrlChanged =
      isDefined(nextUrl) && nextUrl !== existingFlatMcpServer.url;
    const isSignInScopeChanged =
      isDefined(signInScope) &&
      isDefined(existingSignInFlatConnectionProvider) &&
      signInScope !== existingSignInFlatConnectionProvider.scope;

    // A server on its own sign-in, or on none, gets a new sign-in when its URL or scope changes:
    // provider scopes are immutable, and tokens for the old resource stay behind.
    const shouldRecomputeSignIn =
      (isUrlChanged || isSignInScopeChanged) &&
      isUndefined(connectionProviderId) &&
      (!isDefined(existingFlatMcpServer.connectionProviderId) ||
        isDefined(existingSignInFlatConnectionProvider));

    const signInFlatConnectionProvider = shouldRecomputeSignIn
      ? await this.buildNextSignInFlatConnectionProvider({
          flatMcpServer: {
            ...existingFlatMcpServer,
            url: nextUrl ?? existingFlatMcpServer.url,
          },
          isUrlChanged,
          scope:
            signInScope ??
            existingSignInFlatConnectionProvider?.scope ??
            'USER',
        })
      : null;

    const connectionProviderUpdate = shouldRecomputeSignIn
      ? {
          connectionProviderId: signInFlatConnectionProvider?.id ?? null,
          connectionProviderUniversalIdentifier:
            signInFlatConnectionProvider?.universalIdentifier ?? null,
        }
      : isUndefined(connectionProviderId)
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

    await this.runMigrationOrThrow({
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
      await this.deleteSignInFlatConnectionProviderIfUnused({
        flatConnectionProvider: existingSignInFlatConnectionProvider,
        workspaceId,
      });
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
      flatMcpServerMaps: await this.getFlatMcpServerMaps(workspaceId),
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

    const isSignInAttached = await this.attachSignInIfRequired({
      mcpServerId: id,
      workspaceId,
    });

    return isSignInAttached
      ? this.findByIdOrThrow({ id, workspaceId })
      : syncedMcpServer;
  }

  private async attachSignInIfRequired({
    mcpServerId,
    workspaceId,
  }: {
    mcpServerId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const flatMcpServer = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps: await this.getFlatMcpServerMaps(workspaceId),
      mcpServerId,
    });
    const signInFlatConnectionProvider =
      await this.buildSignInFlatConnectionProviderIfRequired({
        mcpServer: flatMcpServer,
        flatApplication: {
          id: flatMcpServer.applicationId,
          universalIdentifier: flatMcpServer.applicationUniversalIdentifier,
        },
        scope: 'USER',
      });

    if (!isDefined(signInFlatConnectionProvider)) {
      return false;
    }

    const flatMcpServerMaps = await this.getFlatMcpServerMaps(workspaceId);
    const latestFlatMcpServer = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps,
      mcpServerId,
    });

    // A concurrent update or sync may have set a provider or moved the URL during the probe
    if (
      isDefined(latestFlatMcpServer.connectionProviderId) ||
      latestFlatMcpServer.url !== flatMcpServer.url
    ) {
      return false;
    }

    await this.runMigrationOrThrow({
      mcpServerOperation: {
        flatEntityToUpdate: [
          fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow({
            flatMcpServerMaps,
            mcpServerId,
            update: {
              connectionProviderId: signInFlatConnectionProvider.id,
              connectionProviderUniversalIdentifier:
                signInFlatConnectionProvider.universalIdentifier,
            },
          }),
        ],
      },
      connectionProviderOperation: {
        flatEntityToCreate: [signInFlatConnectionProvider],
      },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while setting up the MCP server sign-in',
    });

    return true;
  }

  async delete(id: string, workspaceId: string): Promise<McpServerDTO> {
    const { flatMcpServerMaps, flatConnectionProviderMaps } =
      await this.getFlatMaps(workspaceId);
    const flatMcpServerToDelete = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps,
      mcpServerId: id,
    });
    const signInFlatConnectionProvider = this.findSignInFlatConnectionProvider({
      flatMcpServer: flatMcpServerToDelete,
      flatConnectionProviderMaps,
    });

    await this.runMigrationOrThrow({
      mcpServerOperation: { flatEntityToDelete: [flatMcpServerToDelete] },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while deleting MCP server',
    });

    // Deleting a provider cascades to the servers still on it, so it goes once the server is gone.
    if (isDefined(signInFlatConnectionProvider)) {
      await this.deleteSignInFlatConnectionProviderIfUnused({
        flatConnectionProvider: signInFlatConnectionProvider,
        workspaceId,
      });
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
      await this.getFlatMaps(workspaceId);

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
        this.findSignInFlatConnectionProvider({
          flatMcpServer,
          flatConnectionProviderMaps,
        })?.scope ?? null,
    };
  }

  private async buildNextSignInFlatConnectionProvider({
    flatMcpServer,
    isUrlChanged,
    scope,
  }: {
    flatMcpServer: FlatMcpServer;
    isUrlChanged: boolean;
    scope: ConnectionProviderScope;
  }): Promise<FlatConnectionProvider | null> {
    const flatApplication = {
      id: flatMcpServer.applicationId,
      universalIdentifier: flatMcpServer.applicationUniversalIdentifier,
    };

    // Only a new URL can stop asking for sign-in; a scope change keeps the server's current answer.
    return isUrlChanged
      ? this.buildSignInFlatConnectionProviderIfRequired({
          mcpServer: flatMcpServer,
          flatApplication,
          scope,
        })
      : buildMcpServerSignInFlatConnectionProvider({
          mcpServer: flatMcpServer,
          flatApplication,
          scope,
        });
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

  private async buildSignInFlatConnectionProviderIfRequired({
    mcpServer,
    flatApplication,
    scope,
  }: Parameters<
    typeof buildMcpServerSignInFlatConnectionProvider
  >[0]): Promise<FlatConnectionProvider | null> {
    const requiresSignIn = await this.mcpServerClientService.requiresSignIn({
      url: mcpServer.url,
      workspaceId: mcpServer.workspaceId,
    });

    return requiresSignIn
      ? buildMcpServerSignInFlatConnectionProvider({
          mcpServer,
          flatApplication,
          scope,
        })
      : null;
  }

  private findSignInFlatConnectionProvider({
    flatMcpServer,
    flatConnectionProviderMaps,
  }: {
    flatMcpServer: FlatMcpServer;
    flatConnectionProviderMaps: FlatEntityMaps<FlatConnectionProvider>;
  }): FlatConnectionProvider | null {
    if (!isDefined(flatMcpServer.connectionProviderId)) {
      return null;
    }

    const flatConnectionProvider = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatMcpServer.connectionProviderId,
      flatEntityMaps: flatConnectionProviderMaps,
    });

    return isDefined(flatConnectionProvider) &&
      isMcpServerSignInConnectionProvider({
        flatConnectionProvider,
        flatMcpServer,
      })
      ? flatConnectionProvider
      : null;
  }

  private async deleteSignInFlatConnectionProviderIfUnused({
    flatConnectionProvider,
    workspaceId,
  }: {
    flatConnectionProvider: FlatConnectionProvider;
    workspaceId: string;
  }): Promise<void> {
    const { flatMcpServerMaps } = await this.getFlatMaps(workspaceId);
    const isStillUsed = Object.values(
      flatMcpServerMaps.byUniversalIdentifier,
    ).some(
      (flatMcpServer) =>
        flatMcpServer?.connectionProviderId === flatConnectionProvider.id,
    );

    if (isStillUsed) {
      return;
    }

    await this.runMigrationOrThrow({
      connectionProviderOperation: {
        flatEntityToDelete: [flatConnectionProvider],
      },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while deleting the MCP server sign-in',
    });
  }

  private async getFlatMaps(workspaceId: string) {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: ['flatMcpServerMaps', 'flatConnectionProviderMaps'],
      },
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
