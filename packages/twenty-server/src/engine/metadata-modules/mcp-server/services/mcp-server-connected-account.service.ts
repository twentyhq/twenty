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
  }: McpServerTarget): Promise<ConnectedAccountEntity | null> {
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
    target: McpServerTarget,
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

  // No app logic reports failures for these accounts, so a rejected refresh is flagged here
  // and the member is asked to sign in again instead of the account being retried forever.
  async resolveAccessTokenOrMarkAuthFailed({
    connectedAccount,
    workspaceId,
    shouldForceRefresh = false,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    shouldForceRefresh?: boolean;
  }): Promise<string> {
    const { accessToken } =
      !shouldForceRefresh &&
      (await this.connectedAccountRefreshTokensService.isAccessTokenStillValid(
        connectedAccount,
      ))
        ? await this.connectedAccountRefreshTokensService.resolveTokens(
            connectedAccount,
            workspaceId,
          )
        : await this.refreshTokensOrMarkAuthFailed({
            connectedAccount,
            workspaceId,
            shouldForceRefresh,
          });

    return this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: accessToken,
      workspaceId,
    });
  }

  private async refreshTokensOrMarkAuthFailed({
    connectedAccount,
    workspaceId,
    shouldForceRefresh,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    shouldForceRefresh: boolean;
  }) {
    try {
      return shouldForceRefresh
        ? await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
            connectedAccount,
            workspaceId,
          )
        : await this.connectedAccountRefreshTokensService.resolveTokens(
            connectedAccount,
            workspaceId,
          );
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
}
