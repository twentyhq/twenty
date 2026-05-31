import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

import { MicrosoftOAuth2ClientProvider } from './microsoft-oauth2-client.provider';

const FAKE_CIPHER_PREFIX = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}keyid:`;

const wrap = (value: string) => `${FAKE_CIPHER_PREFIX}CIPHER(${value})`;

const buildEncryptionStub = () => ({
  decrypt: jest.fn(
    ({ ciphertext }: { ciphertext: string; workspaceId: string }) => {
      const match = ciphertext.match(
        new RegExp(`^${FAKE_CIPHER_PREFIX}CIPHER\\((.*)\\)$`),
      );

      if (!isDefined(match)) {
        throw new Error(
          `fake encryption stub: decrypt called with a non-CIPHER value: ${ciphertext}`,
        );
      }

      return match[1];
    },
  ),
});

describe('MicrosoftOAuth2ClientProvider', () => {
  let provider: MicrosoftOAuth2ClientProvider;
  let connectedAccountRepository: { findOne: jest.Mock };
  let connectedAccountRefreshTokensService: { resolveTokens: jest.Mock };
  let connectedAccountTokenEncryptionService: { decrypt: jest.Mock };

  const mockWorkspaceId = 'workspace-123';
  const mockConnectedAccountId = 'account-456';
  const mockAccessTokenPlaintext = 'valid-access-token';
  const mockEncryptedAccessToken = wrap(mockAccessTokenPlaintext);

  const mockConnectedAccount = {
    id: mockConnectedAccountId,
    workspaceId: mockWorkspaceId,
    provider: ConnectedAccountProvider.MICROSOFT,
    accessToken: mockEncryptedAccessToken,
    refreshToken: wrap('refresh-token'),
  } as ConnectedAccountEntity;

  beforeEach(async () => {
    connectedAccountTokenEncryptionService = buildEncryptionStub();

    connectedAccountRepository = {
      findOne: jest.fn().mockResolvedValue(mockConnectedAccount),
    };

    connectedAccountRefreshTokensService = {
      resolveTokens: jest.fn().mockResolvedValue({
        accessToken: mockEncryptedAccessToken,
        refreshToken: wrap('refresh-token'),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicrosoftOAuth2ClientProvider,
        {
          provide: ConnectedAccountRefreshTokensService,
          useValue: connectedAccountRefreshTokensService,
        },
        {
          provide: ConnectedAccountTokenEncryptionService,
          useValue: connectedAccountTokenEncryptionService,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
      ],
    }).compile();

    provider = module.get<MicrosoftOAuth2ClientProvider>(
      MicrosoftOAuth2ClientProvider,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getClient', () => {
    it('should load the entity, resolve tokens, decrypt the access token, and return a Microsoft Graph Client', async () => {
      const client = await provider.getClient(mockConnectedAccountId);

      expect(connectedAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockConnectedAccountId },
      });
      expect(
        connectedAccountRefreshTokensService.resolveTokens,
      ).toHaveBeenCalledWith(mockConnectedAccount, mockWorkspaceId);
      expect(
        connectedAccountTokenEncryptionService.decrypt,
      ).toHaveBeenCalledWith({
        ciphertext: mockEncryptedAccessToken,
        workspaceId: mockWorkspaceId,
      });
      expect(client).toBeDefined();
    });

    it('should throw when the connected account does not exist', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(null);

      await expect(provider.getClient(mockConnectedAccountId)).rejects.toThrow(
        ConnectedAccountRefreshAccessTokenException,
      );

      await expect(
        provider.getClient(mockConnectedAccountId),
      ).rejects.toMatchObject({
        code: ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      });
    });

    it('should throw when resolveTokens returns no access token', async () => {
      connectedAccountRefreshTokensService.resolveTokens.mockResolvedValue({
        accessToken: null,
        refreshToken: wrap('refresh-token'),
      });

      await expect(provider.getClient(mockConnectedAccountId)).rejects.toThrow(
        ConnectedAccountRefreshAccessTokenException,
      );

      await expect(
        provider.getClient(mockConnectedAccountId),
      ).rejects.toMatchObject({
        code: ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
      });
    });
  });
});
