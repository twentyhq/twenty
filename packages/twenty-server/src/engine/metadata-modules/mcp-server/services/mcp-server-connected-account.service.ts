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
import { buildMcpServerSignInRequiredException } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-required-exception.util';
import {
  ConnectedAccountRefreshTokensService,
  type ConnectedAccountTokens,
} from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

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

  async findConnectedAccountOrThrowIfSignInRequired(
    target: ConnectedAccountLookup,
  ): Promise<ConnectedAccountEntity | null> {
    if (!isDefined(target.connectionProviderId)) {
      return null;
    }

    const connectedAccount = await this.findUsableConnectedAccount(target);

    if (!isDefined(connectedAccount)) {
      throw buildMcpServerSignInRequiredException();
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

  async resolveAccessTokenOrMarkAuthFailed({
    connectedAccount,
    workspaceId,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
  }): Promise<string> {
    return this.decryptAccessTokenOrMarkAuthFailed({
      connectedAccount,
      workspaceId,
      resolveTokens: () =>
        this.connectedAccountRefreshTokensService.resolveTokens(
          connectedAccount,
          workspaceId,
        ),
    });
  }

  async refreshRejectedAccessTokenOrMarkAuthFailed({
    connectedAccount,
    workspaceId,
    rejectedAccessToken,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    rejectedAccessToken: string;
  }): Promise<string> {
    return this.decryptAccessTokenOrMarkAuthFailed({
      connectedAccount,
      workspaceId,
      resolveTokens: async () => {
        const latestConnectedAccount = await this.reloadConnectedAccount({
          connectedAccount,
          workspaceId,
        });
        const latestAccessToken = latestConnectedAccount.accessToken;

        if (
          isDefined(latestAccessToken) &&
          this.connectedAccountTokenEncryptionService.decrypt({
            ciphertext: latestAccessToken,
            workspaceId,
          }) !== rejectedAccessToken
        ) {
          return { accessToken: latestAccessToken };
        }

        return this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
          latestConnectedAccount,
          workspaceId,
        );
      },
    });
  }

  private async decryptAccessTokenOrMarkAuthFailed({
    connectedAccount,
    workspaceId,
    resolveTokens,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    resolveTokens: () => Promise<Pick<ConnectedAccountTokens, 'accessToken'>>;
  }): Promise<string> {
    try {
      const { accessToken } = await resolveTokens();

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

  private async reloadConnectedAccount({
    connectedAccount,
    workspaceId,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
  }): Promise<ConnectedAccountEntity> {
    const latestConnectedAccount =
      await this.connectedAccountRepository.findOneBy({
        id: connectedAccount.id,
        workspaceId,
      });

    if (!isDefined(latestConnectedAccount)) {
      throw buildMcpServerSignInRequiredException();
    }

    return latestConnectedAccount;
  }
}
