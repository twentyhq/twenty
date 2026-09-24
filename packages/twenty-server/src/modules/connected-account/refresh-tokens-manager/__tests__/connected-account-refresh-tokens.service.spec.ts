import { Repository } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

describe('ConnectedAccountRefreshTokensService', () => {
  let service: ConnectedAccountRefreshTokensService;
  let mockCacheLockService: jest.Mocked<Partial<CacheLockService>>;
  let mockConnectedAccountRepository: jest.Mocked<
    Partial<Repository<ConnectedAccountEntity>>
  >;

  beforeEach(() => {
    mockCacheLockService = {
      withLock: jest
        .fn()
        .mockImplementation((fn: () => Promise<unknown>) => fn()),
    };
    mockConnectedAccountRepository = {
      findOneBy: jest.fn(),
      update: jest.fn(),
    };

    service = new ConnectedAccountRefreshTokensService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      mockConnectedAccountRepository as Repository<ConnectedAccountEntity>,
      mockCacheLockService as CacheLockService,
    );
  });

  describe('resolveTokens', () => {
    it('should return existing tokens on fast path when access token is valid', async () => {
      const connectedAccount = {
        id: 'account-1',
        accessToken: 'enc-access',
        refreshToken: 'enc-refresh',
      } as ConnectedAccountEntity;

      jest
        .spyOn(service as never, 'isAccessTokenStillValid')
        .mockResolvedValue(true as never);
      jest
        .spyOn(service as never, 'getExistingEncryptedTokens')
        .mockReturnValue({
          accessToken: 'enc-access',
          refreshToken: 'enc-refresh',
        } as never);

      const result = await service.resolveTokens(
        connectedAccount,
        'workspace-1',
      );

      expect(result).toEqual({
        accessToken: 'enc-access',
        refreshToken: 'enc-refresh',
      });
      expect(mockCacheLockService.withLock).not.toHaveBeenCalled();
    });

    it('should acquire lock and perform double-checked verification when access token is expired', async () => {
      const connectedAccount = {
        id: 'account-1',
        accessToken: 'old-access',
        refreshToken: 'enc-refresh',
      } as ConnectedAccountEntity;

      const freshAccount = {
        id: 'account-1',
        accessToken: 'new-access-from-other-worker',
        refreshToken: 'new-refresh-from-other-worker',
      } as ConnectedAccountEntity;

      jest
        .spyOn(service as never, 'isAccessTokenStillValid')
        .mockResolvedValueOnce(false as never)
        .mockResolvedValueOnce(true as never);

      mockConnectedAccountRepository.findOneBy.mockResolvedValue(freshAccount);
      jest
        .spyOn(service as never, 'getExistingEncryptedTokens')
        .mockReturnValue({
          accessToken: 'new-access-from-other-worker',
          refreshToken: 'new-refresh-from-other-worker',
        } as never);

      const result = await service.resolveTokens(
        connectedAccount,
        'workspace-1',
      );

      expect(mockCacheLockService.withLock).toHaveBeenCalledWith(
        expect.any(Function),
        'connected-account-refresh-tokens:account-1',
        { ttl: 15_000 },
      );
      expect(result).toEqual({
        accessToken: 'new-access-from-other-worker',
        refreshToken: 'new-refresh-from-other-worker',
      });
    });
  });
});
