import { Injectable } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import { type ConnectionProviderScope } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { findFlatMcpServerByIdOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/find-flat-mcp-server-by-id-or-throw.util';
import { fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-update-mcp-server-input-to-flat-mcp-server-to-update-or-throw.util';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { McpServerMigrationService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-migration.service';
import { buildMcpServerSignInFlatConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-flat-connection-provider.util';
import { findMcpServerSignInFlatConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/find-mcp-server-sign-in-flat-connection-provider.util';

type ConnectionProviderUpdate = Partial<
  Pick<
    FlatMcpServer,
    'connectionProviderId' | 'connectionProviderUniversalIdentifier'
  >
>;

// Provisions the oauth-discovery connection provider Twenty generates for a server that asks for sign-in.
@Injectable()
export class McpServerSignInService {
  constructor(
    private readonly mcpServerMigrationService: McpServerMigrationService,
    private readonly mcpServerClientService: McpServerClientService,
  ) {}

  async computeConnectionProviderUpdate({
    existingFlatMcpServer,
    flatConnectionProviderMaps,
    nextUrl,
    connectionProviderId,
    signInScope,
    workspaceId,
  }: {
    existingFlatMcpServer: FlatMcpServer;
    flatConnectionProviderMaps: FlatEntityMaps<FlatConnectionProvider>;
    nextUrl: string | undefined;
    connectionProviderId: string | null | undefined;
    signInScope: ConnectionProviderScope | null | undefined;
    workspaceId: string;
  }): Promise<{
    existingSignInFlatConnectionProvider: FlatConnectionProvider | null;
    signInFlatConnectionProvider: FlatConnectionProvider | null;
    connectionProviderUpdate: ConnectionProviderUpdate;
  }> {
    const existingSignInFlatConnectionProvider =
      findMcpServerSignInFlatConnectionProvider({
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

    if (shouldRecomputeSignIn) {
      const signInFlatConnectionProvider =
        await this.buildNextSignInFlatConnectionProvider({
          flatMcpServer: {
            ...existingFlatMcpServer,
            url: nextUrl ?? existingFlatMcpServer.url,
          },
          isUrlChanged,
          scope:
            signInScope ??
            existingSignInFlatConnectionProvider?.scope ??
            'USER',
        });

      return {
        existingSignInFlatConnectionProvider,
        signInFlatConnectionProvider,
        connectionProviderUpdate: {
          connectionProviderId: signInFlatConnectionProvider?.id ?? null,
          connectionProviderUniversalIdentifier:
            signInFlatConnectionProvider?.universalIdentifier ?? null,
        },
      };
    }

    return {
      existingSignInFlatConnectionProvider,
      signInFlatConnectionProvider: null,
      connectionProviderUpdate: isUndefined(connectionProviderId)
        ? {}
        : {
            connectionProviderId,
            connectionProviderUniversalIdentifier:
              await this.mcpServerMigrationService.resolveConnectionProviderUniversalIdentifier(
                { connectionProviderId, workspaceId },
              ),
          },
    };
  }

  async attachSignInIfRequired({
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

    await this.mcpServerMigrationService.runMigrationOrThrow({
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

  async buildSignInFlatConnectionProviderIfRequired({
    mcpServer,
    flatApplication,
    scope,
  }: {
    mcpServer: Pick<FlatMcpServer, 'name' | 'label' | 'url' | 'workspaceId'>;
    flatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
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

  async deleteSignInFlatConnectionProviderIfUnused({
    flatConnectionProvider,
    workspaceId,
  }: {
    flatConnectionProvider: FlatConnectionProvider;
    workspaceId: string;
  }): Promise<void> {
    const { flatMcpServerMaps } =
      await this.mcpServerMigrationService.getFlatMaps(workspaceId);
    const isStillUsed = Object.values(
      flatMcpServerMaps.byUniversalIdentifier,
    ).some(
      (flatMcpServer) =>
        flatMcpServer?.connectionProviderId === flatConnectionProvider.id,
    );

    if (isStillUsed) {
      return;
    }

    await this.mcpServerMigrationService.runMigrationOrThrow({
      connectionProviderOperation: {
        flatEntityToDelete: [flatConnectionProvider],
      },
      workspaceId,
      errorMessage:
        'Multiple validation errors occurred while deleting the MCP server sign-in',
    });
  }
}
