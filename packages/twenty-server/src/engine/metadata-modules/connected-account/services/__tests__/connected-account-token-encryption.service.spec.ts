import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import {
  ENVELOPE_PREFIX,
  ENVELOPE_V2_PREFIX,
} from 'src/engine/core-modules/secret-encryption/utils/envelope.util';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

describe('ConnectedAccountTokenEncryptionService', () => {
  const workspaceId = '00000000-0000-0000-0000-000000000000';

  const buildEncryptionService = (
    encryptionKey: string = 'mock-app-secret-for-testing-12345678',
  ): ConnectedAccountTokenEncryptionService => {
    const environmentConfigDriver = {
      get: jest.fn((key: string) => {
        if (key === 'APP_SECRET') return encryptionKey;

        return undefined;
      }),
    } as unknown as EnvironmentConfigDriver;

    return new ConnectedAccountTokenEncryptionService(
      new SecretEncryptionService(environmentConfigDriver),
    );
  };

  describe('encrypt', () => {
    it('should produce a value that starts with the enc:v2: prefix and hides the plaintext', () => {
      const service = buildEncryptionService();
      const plaintext = 'plaintext-token';

      const ciphertext = service.encrypt(plaintext, workspaceId);

      expect(ciphertext.startsWith(ENVELOPE_V2_PREFIX)).toBe(true);
      expect(ciphertext).not.toContain(plaintext);
    });

    it('should throw when given an already-prefixed value', () => {
      const service = buildEncryptionService();

      expect(() =>
        service.encrypt(
          `${ENVELOPE_PREFIX}v2:abcd1234:already-encrypted`,
          workspaceId,
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `"ConnectedAccountTokenEncryptionService.encrypt received an already-prefixed value. This indicates a double-encryption bug — the caller is encrypting ciphertext."`,
      );
    });
  });

  describe('encryptNullable', () => {
    it('should pass null through unchanged', () => {
      const service = buildEncryptionService();

      expect(service.encryptNullable(null, workspaceId)).toBeNull();
    });

    it('should encrypt non-null values like encrypt()', () => {
      const service = buildEncryptionService();

      const ciphertext = service.encryptNullable('plaintext', workspaceId);

      expect(ciphertext).not.toBeNull();
      expect(ciphertext!.startsWith(ENVELOPE_V2_PREFIX)).toBe(true);
    });
  });

  describe('decrypt', () => {
    it('should roundtrip cleanly with encrypt()', () => {
      const service = buildEncryptionService();
      const plaintext = 'roundtrip-token-value';

      expect(
        service.decrypt(service.encrypt(plaintext, workspaceId), workspaceId),
      ).toBe(plaintext);
    });

    it('should produce different ciphertexts for the same plaintext under different workspaceIds', () => {
      const service = buildEncryptionService();
      const plaintext = 'same-plaintext';
      const otherWorkspaceId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

      const ciphertextA = service.encrypt(plaintext, workspaceId);
      const ciphertextB = service.encrypt(plaintext, otherWorkspaceId);

      expect(ciphertextA).not.toBe(ciphertextB);
    });

    it('should fail to decrypt under a different workspaceId (HKDF context isolation)', () => {
      const service = buildEncryptionService();
      const plaintext = 'workspace-bound-token';
      const otherWorkspaceId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

      const ciphertext = service.encrypt(plaintext, workspaceId);

      expect(() => service.decrypt(ciphertext, otherWorkspaceId)).toThrow();
    });

    it('should return a plaintext token as-is during the rollout window', () => {
      const service = buildEncryptionService();

      expect(service.decrypt('raw-plaintext-no-prefix', workspaceId)).toBe(
        'raw-plaintext-no-prefix',
      );
    });
  });

  describe('decryptNullable', () => {
    it('should pass null through unchanged', () => {
      const service = buildEncryptionService();

      expect(service.decryptNullable(null, workspaceId)).toBeNull();
    });

    it('should decrypt non-null values like decrypt()', () => {
      const service = buildEncryptionService();
      const plaintext = 'rt-value';
      const ciphertext = service.encrypt(plaintext, workspaceId);

      expect(service.decryptNullable(ciphertext, workspaceId)).toBe(plaintext);
    });
  });

  describe('encryptTokenPair', () => {
    it('should encrypt both tokens and return them keyed as encrypted*', () => {
      const service = buildEncryptionService();

      const { encryptedAccessToken, encryptedRefreshToken } =
        service.encryptTokenPair({
          accessToken: 'at-plaintext',
          refreshToken: 'rt-plaintext',
          workspaceId,
        });

      expect(encryptedAccessToken.startsWith(ENVELOPE_V2_PREFIX)).toBe(true);
      expect(encryptedRefreshToken!.startsWith(ENVELOPE_V2_PREFIX)).toBe(true);
      expect(service.decrypt(encryptedAccessToken, workspaceId)).toBe(
        'at-plaintext',
      );
      expect(service.decrypt(encryptedRefreshToken!, workspaceId)).toBe(
        'rt-plaintext',
      );
    });

    it('should pass a null refreshToken through unencrypted', () => {
      const service = buildEncryptionService();

      const { encryptedAccessToken, encryptedRefreshToken } =
        service.encryptTokenPair({
          accessToken: 'at-plaintext',
          refreshToken: null,
          workspaceId,
        });

      expect(encryptedAccessToken.startsWith(ENVELOPE_V2_PREFIX)).toBe(true);
      expect(encryptedRefreshToken).toBeNull();
    });

    it('should throw when accessToken is already encrypted', () => {
      const service = buildEncryptionService();

      expect(() =>
        service.encryptTokenPair({
          accessToken: `${ENVELOPE_PREFIX}v2:abcd1234:already-encrypted`,
          refreshToken: 'rt-plaintext',
          workspaceId,
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `"ConnectedAccountTokenEncryptionService.encrypt received an already-prefixed value. This indicates a double-encryption bug — the caller is encrypting ciphertext."`,
      );
    });
  });
});
