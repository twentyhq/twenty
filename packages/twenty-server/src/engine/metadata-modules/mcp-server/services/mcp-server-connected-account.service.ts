import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { type McpServerTarget } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-target.type';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

type ConnectedAccountLookup = Pick<
  McpServerTarget,
  'connectionProviderId' | 'workspaceId' | 'userWorkspaceId'
>;

const UNRECOVERABLE_REFRESH_CODES: ConnectedAccountRefreshAccessTokenExceptionCode[] =
  [
    ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
    ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
  ];

@Injectable()
export class McpServerConnectedAccountService {
  constructor(
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async findUsableConnectedAccount({
    connectionProviderId,
    workspaceId,
    userWorkspaceId,
  }: ConnectedAccountLookup): Promise<ConnectedAccountEntity | null> {
    if (!isDefined(connectionProviderId)) {
      return null;
    }

    const baseWhere = {
      workspaceId,
      connectionProviderId,
      archivedAt: IsNull(),
      authFailedAt: IsNull(),
    };

    const connectedAccounts = await this.connectedAccountRepository.find({
      where: isDefined(userWorkspaceId)
        ? buildConnectedAccountUsableByCallerWhere({
            baseWhere,
            userWorkspaceId,
          })
        : { ...baseWhere, scope: 'WORKSPACE' },
      order: { createdAt: 'ASC' },
    });

    return (
      connectedAccounts.find(
        (connectedAccount) =>
          connectedAccount.userWorkspaceId === userWorkspaceId,
      ) ??
      connectedAccounts[0] ??
      null
    );
  }

  async findConnectedAccountOrThrow(
    target: ConnectedAccountLookup,
  ): Promise<ConnectedAccountEntity | null> {
    const { connectionProviderId, workspaceId } = target;

    if (!isDefined(connectionProviderId)) {
      return null;
    }

    const connectedAccount = await this.findUsableConnectedAccount(target);

    if (!isDefined(connectedAccount)) {
      throw new McpServerException(
        `No connected account usable by the caller for provider ${connectionProviderId} in workspace ${workspaceId}`,
        McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
      );
    }

    return connectedAccount;
  }

  async markConnectedAccountAuthFailed({
    connectedAccountId,
    workspaceId,
    reason,
  }: {
    connectedAccountId: string;
    workspaceId: string;
    reason: string;
  }): Promise<void> {
    await this.connectedAccountRepository.update(
      { id: connectedAccountId, workspaceId },
      { authFailedAt: new Date(), authFailedReason: reason },
    );
  }

  // No app logic reports failures for these accounts, so a rejected refresh signs the account out here.
  async resolveAccessTokenOrMarkAuthFailed({
    connectedAccount,
    workspaceId,
    shouldForceRefresh = false,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    shouldForceRefresh?: boolean;
  }): Promise<string> {
    try {
      const { accessToken } = shouldForceRefresh
        ? await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
            await this.reloadConnectedAccount({
              connectedAccount,
              workspaceId,
            }),
            workspaceId,
          )
        : await this.connectedAccountRefreshTokensService.resolveTokens(
            connectedAccount,
            workspaceId,
          );

      return this.connectedAccountTokenEncryptionService.decrypt({
        ciphertext: accessToken,
        workspaceId,
      });
    } catch (error) {
      if (
        !(error instanceof ConnectedAccountRefreshAccessTokenException) ||
        !UNRECOVERABLE_REFRESH_CODES.includes(error.code)
      ) {
        throw error;
      }

      await this.markConnectedAccountAuthFailed({
        connectedAccountId: connectedAccount.id,
        workspaceId,
        reason: error.message,
      });

      throw new McpServerException(
        'The connected account for this MCP server was signed out. Sign in again to use it.',
        McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
      );
    }
  }

  // The first call may have refreshed already; a forced refresh must compare against the saved timestamp, not the one loaded before it.
  private async reloadConnectedAccount({
    connectedAccount,
    workspaceId,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
  }): Promise<ConnectedAccountEntity> {
    return this.connectedAccountRepository.findOneByOrFail({
      id: connectedAccount.id,
      workspaceId,
    });
  }
}
