import { Injectable } from '@nestjs/common';

import { type OAuthDiscoveryState } from '@modelcontextprotocol/sdk/client/auth.js';
import { type OAuthClientInformationMixed } from '@modelcontextprotocol/sdk/shared/auth.js';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { McpServerOAuthClientEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server-oauth-client.entity';
import { type McpServerOAuthStoredClient } from 'src/engine/metadata-modules/mcp-server/oauth/types/mcp-server-oauth-stored-client.type';
import { type McpServerOAuthRegistrationMethod } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-oauth-registration-method.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class McpServerOAuthClientService {
  constructor(
    @InjectWorkspaceScopedRepository(McpServerOAuthClientEntity)
    private readonly mcpServerOAuthClientRepository: WorkspaceScopedRepository<McpServerOAuthClientEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  async findStoredClient({
    mcpServerId,
    workspaceId,
  }: {
    mcpServerId: string;
    workspaceId: string;
  }): Promise<McpServerOAuthStoredClient | null> {
    const oauthClient = await this.mcpServerOAuthClientRepository.findOneBy(
      workspaceId,
      { mcpServerId },
    );

    if (!isDefined(oauthClient)) {
      return null;
    }

    const clientSecret =
      this.connectedAccountTokenEncryptionService.decryptNullable({
        ciphertext: oauthClient.clientSecret,
        workspaceId,
      });

    return {
      registrationMethod: oauthClient.registrationMethod,
      redirectUri: oauthClient.redirectUri,
      discoveryState: oauthClient.discoveryState,
      clientInformation: {
        client_id: oauthClient.clientId,
        redirect_uris: [oauthClient.redirectUri],
        ...(isDefined(clientSecret) && { client_secret: clientSecret }),
        ...(isDefined(oauthClient.clientSecretExpiresAt) && {
          client_secret_expires_at: Math.floor(
            oauthClient.clientSecretExpiresAt.getTime() / 1000,
          ),
        }),
        ...(isDefined(oauthClient.tokenEndpointAuthMethod) && {
          token_endpoint_auth_method: oauthClient.tokenEndpointAuthMethod,
        }),
      },
    };
  }

  async saveClient({
    mcpServerId,
    workspaceId,
    registrationMethod,
    redirectUri,
    clientInformation,
    discoveryState,
  }: {
    mcpServerId: string;
    workspaceId: string;
    registrationMethod: McpServerOAuthRegistrationMethod;
    redirectUri: string;
    clientInformation: OAuthClientInformationMixed;
    discoveryState: OAuthDiscoveryState;
  }): Promise<void> {
    await this.mcpServerOAuthClientRepository.upsert(
      workspaceId,
      {
        mcpServerId,
        registrationMethod,
        redirectUri,
        // TypeORM's deep partial cannot express the SDK's open-ended metadata objects
        discoveryState:
          discoveryState as QueryDeepPartialEntity<OAuthDiscoveryState>,
        clientId: clientInformation.client_id,
        clientSecret:
          this.connectedAccountTokenEncryptionService.encryptNullable({
            plaintext: (clientInformation.client_secret ??
              null) as PlaintextString | null,
            workspaceId,
          }),
        // 0 means the secret never expires (RFC 7591)
        clientSecretExpiresAt: clientInformation.client_secret_expires_at
          ? new Date(clientInformation.client_secret_expires_at * 1000)
          : null,
        tokenEndpointAuthMethod:
          'token_endpoint_auth_method' in clientInformation
            ? (clientInformation.token_endpoint_auth_method ?? null)
            : null,
      },
      ['mcpServerId'],
    );
  }

  async deleteClient({
    mcpServerId,
    workspaceId,
  }: {
    mcpServerId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.mcpServerOAuthClientRepository.delete(workspaceId, {
      mcpServerId,
    });
  }
}
