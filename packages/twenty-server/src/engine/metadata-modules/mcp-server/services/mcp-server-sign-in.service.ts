import { Injectable } from '@nestjs/common';

import { type ConnectionProviderScope } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { findFlatMcpServerByIdOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/find-flat-mcp-server-by-id-or-throw.util';
import { fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-update-mcp-server-input-to-flat-mcp-server-to-update-or-throw.util';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { McpServerMigrationService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-migration.service';
import { buildMcpServerSignInFlatConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-flat-connection-provider.util';
import { isMcpServerSignInConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-server-sign-in-connection-provider.util';

type SignInMcpServer = Pick<
  FlatMcpServer,
  'name' | 'label' | 'url' | 'workspaceId'
>;

type SignInFlatApplication = {
  id: string;
  universalIdentifier: string;
};

// Null keeps the server's provider; otherwise it moves to the planned provider, or to none.
export type McpServerSignInUpdatePlan = {
  flatConnectionProviderToCreate: FlatConnectionProvider | null;
} | null;

// Owns the connection provider Twenty creates for a server that asks for sign-in.
// Create and update plans run in the caller's migration, alongside the server change.
@Injectable()
export class McpServerSignInService {
  constructor(
    private readonly mcpServerClientService: McpServerClientService,
    private readonly mcpServerMigrationService: McpServerMigrationService,
  ) {}

  async buildIfRequired({
    mcpServer,
    flatApplication,
    scope,
  }: {
    mcpServer: SignInMcpServer;
    flatApplication: SignInFlatApplication;
    scope: ConnectionProviderScope;
  }): Promise<FlatConnectionProvider | null> {
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

  // A server on its own sign-in, or on none, gets a new one when its URL or scope changes; an app's provider stays.
  async planUpdate({
    existingFlatMcpServer,
    existingSignInFlatConnectionProvider,
    nextUrl,
    signInScope,
    isConnectionProviderChosen,
  }: {
    existingFlatMcpServer: FlatMcpServer;
    existingSignInFlatConnectionProvider: FlatConnectionProvider | null;
    nextUrl: string | undefined;
    signInScope: ConnectionProviderScope | undefined;
    isConnectionProviderChosen: boolean;
  }): Promise<McpServerSignInUpdatePlan> {
    const isUrlChanged =
      isDefined(nextUrl) && nextUrl !== existingFlatMcpServer.url;
    const isSignInScopeChanged =
      isDefined(signInScope) &&
      isDefined(existingSignInFlatConnectionProvider) &&
      signInScope !== existingSignInFlatConnectionProvider.scope;
    const isOnOwnSignInOrNone =
      !isDefined(existingFlatMcpServer.connectionProviderId) ||
      isDefined(existingSignInFlatConnectionProvider);

    if (
      !(isUrlChanged || isSignInScopeChanged) ||
      isConnectionProviderChosen ||
      !isOnOwnSignInOrNone
    ) {
      return null;
    }

    const mcpServer = {
      ...existingFlatMcpServer,
      url: nextUrl ?? existingFlatMcpServer.url,
    };
    const flatApplication = this.getFlatApplication(existingFlatMcpServer);
    // Provider scopes are immutable, so a new scope means a new provider
    const scope =
      signInScope ?? existingSignInFlatConnectionProvider?.scope ?? 'USER';

    // Only a new URL can stop asking for sign-in; a scope change keeps the server's current answer
    return {
      flatConnectionProviderToCreate: isUrlChanged
        ? await this.buildIfRequired({ mcpServer, flatApplication, scope })
        : buildMcpServerSignInFlatConnectionProvider({
            mcpServer,
            flatApplication,
            scope,
          }),
    };
  }

  // The check at creation can miss a server that was down or started asking later; tool sync calls this then.
  async attachIfRequired({
    mcpServerId,
    workspaceId,
  }: {
    mcpServerId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const flatMcpServer = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps:
        await this.mcpServerMigrationService.getFlatMcpServerMaps(workspaceId),
      mcpServerId,
    });
    const flatConnectionProvider = await this.buildIfRequired({
      mcpServer: flatMcpServer,
      flatApplication: this.getFlatApplication(flatMcpServer),
      scope: 'USER',
    });

    if (!isDefined(flatConnectionProvider)) {
      return false;
    }

    const flatMcpServerMaps =
      await this.mcpServerMigrationService.getFlatMcpServerMaps(workspaceId);
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

    await this.mcpServerMigrationService.runOrThrow({
      mcpServerOperation: {
        flatEntityToUpdate: [
          fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow({
            flatMcpServerMaps,
            mcpServerId,
            update: {
              connectionProviderId: flatConnectionProvider.id,
              connectionProviderUniversalIdentifier:
                flatConnectionProvider.universalIdentifier,
            },
          }),
        ],
      },
      connectionProviderOperation: {
        flatEntityToCreate: [flatConnectionProvider],
      },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while setting up the MCP server sign-in',
    });

    return true;
  }

  // Deleting a provider cascades to the servers still on it, so it goes only once no server uses it.
  async deleteIfUnused({
    flatConnectionProvider,
    workspaceId,
  }: {
    flatConnectionProvider: FlatConnectionProvider;
    workspaceId: string;
  }): Promise<void> {
    const flatMcpServerMaps =
      await this.mcpServerMigrationService.getFlatMcpServerMaps(workspaceId);
    const isUsed = Object.values(flatMcpServerMaps.byUniversalIdentifier).some(
      (flatMcpServer) =>
        flatMcpServer?.connectionProviderId === flatConnectionProvider.id,
    );

    if (isUsed) {
      return;
    }

    await this.mcpServerMigrationService.runOrThrow({
      connectionProviderOperation: {
        flatEntityToDelete: [flatConnectionProvider],
      },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while deleting the MCP server sign-in',
    });
  }

  find({
    flatMcpServer,
    flatConnectionProviderMaps,
  }: {
    flatMcpServer: Pick<
      FlatMcpServer,
      'connectionProviderId' | 'url' | 'applicationId'
    >;
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

  private getFlatApplication(
    flatMcpServer: Pick<
      FlatMcpServer,
      'applicationId' | 'applicationUniversalIdentifier'
    >,
  ): SignInFlatApplication {
    return {
      id: flatMcpServer.applicationId,
      universalIdentifier: flatMcpServer.applicationUniversalIdentifier,
    };
  }
}
