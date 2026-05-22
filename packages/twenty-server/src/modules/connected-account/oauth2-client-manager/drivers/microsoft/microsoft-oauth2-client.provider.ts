import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from '@microsoft/microsoft-graph-client';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { MicrosoftOAuth2ClientAuthProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-auth-provider';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

@Injectable()
export class MicrosoftOAuth2ClientProvider {
  constructor(
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  public async getClient(connectedAccountId: string): Promise<Client> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
    });

    if (!isDefined(connectedAccount)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Connected account ${connectedAccountId} not found`,
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      );
    }

    if (connectedAccount.provider !== ConnectedAccountProvider.MICROSOFT) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Connected account ${connectedAccountId} is not a Microsoft provider (got ${connectedAccount.provider})`,
        ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
      );
    }

    const { accessToken: encryptedAccessToken } =
      await this.connectedAccountRefreshTokensService.resolveTokens(
        connectedAccount,
        connectedAccount.workspaceId,
      );

    if (!isDefined(encryptedAccessToken)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Access token missing for connected account ${connectedAccountId}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
      );
    }

    const plaintextAccessToken =
      this.connectedAccountTokenEncryptionService.decrypt({
        ciphertext: encryptedAccessToken,
        workspaceId: connectedAccount.workspaceId,
      });

    const authProvider = new MicrosoftOAuth2ClientAuthProvider(
      plaintextAccessToken,
    );

    return Client.initWithMiddleware({
      defaultVersion: 'v1.0',
      debugLogging: false,
      authProvider,
    });
  }
}
