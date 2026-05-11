import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import {
  CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX,
  ConnectedAccountTokenEncryptionService,
} from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

describe('ConnectedAccountTokenEncryptionService', () => {
  const buildEncryptionService = (): ConnectedAccountTokenEncryptionService => {
    const environmentConfigDriver = {
      get: jest.fn().mockReturnValue('mock-app-secret-for-testing-12345678'),
    } as unknown as EnvironmentConfigDriver;

    return new ConnectedAccountTokenEncryptionService(
      new SecretEncryptionService(environmentConfigDriver),
    );
  };

  describe('encrypt', () => {
    it('should produce a value that starts with the enc:v1: prefix and hides the plaintext', () => {
      const service = buildEncryptionService();
      const plaintext = 'plaintext-token';

      const ciphertext = service.encrypt(plaintext);

      expect(
        ciphertext.startsWith(CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX),
      ).toBe(true);
      expect(ciphertext).not.toContain(plaintext);
    });

    it('should throw when given an already-prefixed value', () => {
      const service = buildEncryptionService();

      expect(() =>
        service.encrypt(
          `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}already-encrypted`,
        ),
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe('encryptNullable', () => {
    it('should pass null through unchanged', () => {
      const service = buildEncryptionService();

      expect(service.encryptNullable(null)).toBeNull();
    });

    it('should encrypt non-null values like encrypt()', () => {
      const service = buildEncryptionService();

      const ciphertext = service.encryptNullable('plaintext');

      expect(ciphertext).not.toBeNull();
      expect(
        ciphertext!.startsWith(CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX),
      ).toBe(true);
    });
  });

  describe('decrypt', () => {
    it('should roundtrip cleanly with encrypt()', () => {
      const service = buildEncryptionService();
      const plaintext = 'roundtrip-token-value';

      expect(service.decrypt(service.encrypt(plaintext))).toBe(plaintext);
    });

    // v2.4.0 deployment-window tolerance. Should be patch to throw after v2.4.1
    it.failing(
      'should throw when given a value without the enc:v1: prefix',
      () => {
        const service = buildEncryptionService();

        expect(() =>
          service.decrypt('raw-plaintext-without-prefix'),
        ).toThrowErrorMatchingSnapshot();
      },
    );
  });

  describe('decryptNullable', () => {
    it('should pass null through unchanged', () => {
      const service = buildEncryptionService();

      expect(service.decryptNullable(null)).toBeNull();
    });

    it('should decrypt non-null values like decrypt()', () => {
      const service = buildEncryptionService();
      const plaintext = 'rt-value';
      const ciphertext = service.encrypt(plaintext);

      expect(service.decryptNullable(ciphertext)).toBe(plaintext);
    });
  });

  describe('encryptTokenPair', () => {
    it('should encrypt both tokens and return them keyed as encrypted*', () => {
      const service = buildEncryptionService();

      const { encryptedAccessToken, encryptedRefreshToken } =
        service.encryptTokenPair({
          accessToken: 'at-plaintext',
          refreshToken: 'rt-plaintext',
        });

      expect(
        encryptedAccessToken.startsWith(
          CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX,
        ),
      ).toBe(true);
      expect(
        encryptedRefreshToken!.startsWith(
          CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX,
        ),
      ).toBe(true);
      expect(service.decrypt(encryptedAccessToken)).toBe('at-plaintext');
      expect(service.decrypt(encryptedRefreshToken!)).toBe('rt-plaintext');
    });

    it('should pass a null refreshToken through unencrypted', () => {
      const service = buildEncryptionService();

      const { encryptedAccessToken, encryptedRefreshToken } =
        service.encryptTokenPair({
          accessToken: 'at-plaintext',
          refreshToken: null,
        });

      expect(
        encryptedAccessToken.startsWith(
          CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX,
        ),
      ).toBe(true);
      expect(encryptedRefreshToken).toBeNull();
    });

    it('should throw when accessToken is already encrypted', () => {
      const service = buildEncryptionService();

      expect(() =>
        service.encryptTokenPair({
          accessToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}already-encrypted`,
          refreshToken: 'rt-plaintext',
        }),
      ).toThrowErrorMatchingSnapshot();
    });
  });
});
