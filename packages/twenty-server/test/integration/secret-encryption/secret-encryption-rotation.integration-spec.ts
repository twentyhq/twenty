import { isDefined } from 'twenty-shared/utils';

import {
  SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
  SECRET_ENCRYPTION_KEY_ID_REGEX,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionExceptionCode } from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

// End-to-end coverage of the three-key rotation contract: ENCRYPTION_KEY
// (primary) > FALLBACK_ENCRYPTION_KEY (decrypt-only fallback) > APP_SECRET
// (legacy primary). Uses the real services and real Node crypto — only the
// EnvironmentConfigDriver is faked, so we can flip the operator-visible
// configuration between sub-scenarios within a single test process.

type EnvMap = Partial<{
  ENCRYPTION_KEY: string;
  FALLBACK_ENCRYPTION_KEY: string;
  APP_SECRET: string;
}>;

const buildDriver = (env: EnvMap): EnvironmentConfigDriver =>
  ({
    get: (key: keyof EnvMap) => env[key],
  }) as unknown as EnvironmentConfigDriver;

const buildServices = (env: EnvMap) => {
  const secretEncryptionService = new SecretEncryptionService(buildDriver(env));
  const connectedAccountTokenEncryptionService =
    new ConnectedAccountTokenEncryptionService(secretEncryptionService);

  return { secretEncryptionService, connectedAccountTokenEncryptionService };
};

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
const OTHER_WORKSPACE_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const KEY_APP_SECRET = 'legacy-app-secret-9b8c7d6e5f4a3b2c1d0e9f8a';
const KEY_X = 'encryption-key-x-abcdefghijklmnopqrstuvwxyz';
const KEY_Y = 'encryption-key-y-zyxwvutsrqponmlkjihgfedcba';

describe('Secret encryption key rotation (integration)', () => {
  describe('APP_SECRET only — bootstrap path', () => {
    it('emits enc:v2:<keyId>:<base64> where keyId is derived from APP_SECRET', () => {
      const { secretEncryptionService } = buildServices({
        APP_SECRET: KEY_APP_SECRET,
      });

      const ciphertext = secretEncryptionService.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });

      expect(ciphertext).toMatch(
        new RegExp(
          `^${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${SECRET_ENCRYPTION_KEY_ID_REGEX.source.replace(/^\^|\$$/g, '')}:[A-Za-z0-9+/=]+$`,
        ),
      );
      const keyId = ciphertext.split(':')[2];

      expect(keyId).toBe(computeEncryptionKeyId({ rawKey: KEY_APP_SECRET }));
    });

    it('round-trips encrypt/decrypt under the same APP_SECRET', () => {
      const { secretEncryptionService } = buildServices({
        APP_SECRET: KEY_APP_SECRET,
      });
      const ciphertext = secretEncryptionService.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });

      expect(
        secretEncryptionService.decryptVersioned(ciphertext, {
          workspaceId: WORKSPACE_ID,
        }),
      ).toBe('secret');
    });
  });

  describe('ENCRYPTION_KEY takes precedence over APP_SECRET', () => {
    it('encrypts with ENCRYPTION_KEY and embeds its fingerprint, not APP_SECRET fingerprint', () => {
      const { secretEncryptionService } = buildServices({
        ENCRYPTION_KEY: KEY_X,
        APP_SECRET: KEY_APP_SECRET,
      });

      const ciphertext = secretEncryptionService.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });

      const keyId = ciphertext.split(':')[2];

      expect(keyId).toBe(computeEncryptionKeyId({ rawKey: KEY_X }));
      expect(keyId).not.toBe(
        computeEncryptionKeyId({ rawKey: KEY_APP_SECRET }),
      );
    });

    it('cannot decrypt rows that were written under APP_SECRET only — error names the missing fingerprint', () => {
      const { secretEncryptionService: oldService } = buildServices({
        APP_SECRET: KEY_APP_SECRET,
      });
      const legacyCiphertext = oldService.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });

      const { secretEncryptionService: newService } = buildServices({
        ENCRYPTION_KEY: KEY_X,
      });

      const oldKeyId = computeEncryptionKeyId({ rawKey: KEY_APP_SECRET });

      expect(() =>
        newService.decryptVersioned(legacyCiphertext, {
          workspaceId: WORKSPACE_ID,
        }),
      ).toThrow(
        expect.objectContaining({
          code: SecretEncryptionExceptionCode.UNKNOWN_KEY_ID,
          message: expect.stringContaining(oldKeyId) as string,
        }),
      );
    });
  });

  describe('rotation: old key as FALLBACK_ENCRYPTION_KEY', () => {
    it('decrypts pre-rotation rows via fallback and writes new rows under the new primary', () => {
      const { secretEncryptionService: preRotation } = buildServices({
        APP_SECRET: KEY_X,
      });
      const preRotationCiphertext = preRotation.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });

      const { secretEncryptionService: rotated } = buildServices({
        ENCRYPTION_KEY: KEY_Y,
        FALLBACK_ENCRYPTION_KEY: KEY_X,
      });

      expect(
        rotated.decryptVersioned(preRotationCiphertext, {
          workspaceId: WORKSPACE_ID,
        }),
      ).toBe('secret');

      const postRotationCiphertext = rotated.encryptVersioned('new-secret', {
        workspaceId: WORKSPACE_ID,
      });
      const postRotationKeyId = postRotationCiphertext.split(':')[2];

      expect(postRotationKeyId).toBe(computeEncryptionKeyId({ rawKey: KEY_Y }));
      expect(
        rotated.decryptVersioned(postRotationCiphertext, {
          workspaceId: WORKSPACE_ID,
        }),
      ).toBe('new-secret');
    });

    it('rejects an accidental rotation rollback — removing the new key leaves new rows undecryptable with a clear error', () => {
      const { secretEncryptionService: rotated } = buildServices({
        ENCRYPTION_KEY: KEY_Y,
        FALLBACK_ENCRYPTION_KEY: KEY_X,
      });
      const newRowCiphertext = rotated.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });

      const { secretEncryptionService: rolledBack } = buildServices({
        ENCRYPTION_KEY: KEY_X,
      });

      const newKeyId = computeEncryptionKeyId({ rawKey: KEY_Y });

      expect(() =>
        rolledBack.decryptVersioned(newRowCiphertext, {
          workspaceId: WORKSPACE_ID,
        }),
      ).toThrow(
        expect.objectContaining({
          code: SecretEncryptionExceptionCode.UNKNOWN_KEY_ID,
          message: expect.stringContaining(newKeyId) as string,
        }),
      );
    });
  });

  describe('failure modes', () => {
    it('throws NO_ENCRYPTION_KEY_CONFIGURED when none of ENCRYPTION_KEY, APP_SECRET is set', () => {
      const { secretEncryptionService } = buildServices({});

      expect(() =>
        secretEncryptionService.encryptVersioned('secret', {
          workspaceId: WORKSPACE_ID,
        }),
      ).toThrow(
        expect.objectContaining({
          code: SecretEncryptionExceptionCode.NO_ENCRYPTION_KEY_CONFIGURED,
        }),
      );
    });

    it('treats empty-string env vars as unset (avoids subtle config bugs from blank docker-compose entries)', () => {
      const { secretEncryptionService } = buildServices({
        ENCRYPTION_KEY: '',
        FALLBACK_ENCRYPTION_KEY: '',
        APP_SECRET: KEY_APP_SECRET,
      });

      const ciphertext = secretEncryptionService.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });
      const keyId = ciphertext.split(':')[2];

      expect(keyId).toBe(computeEncryptionKeyId({ rawKey: KEY_APP_SECRET }));
    });

    it('throws on tampered ciphertext (GCM auth tag rejects bit-level corruption)', () => {
      const { secretEncryptionService } = buildServices({
        ENCRYPTION_KEY: KEY_X,
      });
      const ciphertext = secretEncryptionService.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });
      const [prefix, version, keyId, payload] = ciphertext.split(':');
      const buffer = Buffer.from(payload, 'base64');

      buffer[Math.floor(buffer.length / 2)] ^= 0xff;
      const tampered = `${prefix}:${version}:${keyId}:${buffer.toString('base64')}`;

      expect(() =>
        secretEncryptionService.decryptVersioned(tampered, {
          workspaceId: WORKSPACE_ID,
        }),
      ).toThrow();
    });
  });

  describe('per-workspace HKDF context isolation', () => {
    it('binds the ciphertext to the workspaceId — decrypt under a different workspace fails', () => {
      const { secretEncryptionService } = buildServices({
        ENCRYPTION_KEY: KEY_X,
      });
      const ciphertext = secretEncryptionService.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });

      expect(() =>
        secretEncryptionService.decryptVersioned(ciphertext, {
          workspaceId: OTHER_WORKSPACE_ID,
        }),
      ).toThrow();
    });

    it('produces different ciphertexts for the same plaintext under different workspaces', () => {
      const { secretEncryptionService } = buildServices({
        ENCRYPTION_KEY: KEY_X,
      });

      const a = secretEncryptionService.encryptVersioned('secret', {
        workspaceId: WORKSPACE_ID,
      });
      const b = secretEncryptionService.encryptVersioned('secret', {
        workspaceId: OTHER_WORKSPACE_ID,
      });

      expect(a).not.toBe(b);
    });
  });

  describe('ConnectedAccountTokenEncryptionService — rotation through the high-level wrapper', () => {
    it('round-trips a token pair under the same key configuration', () => {
      const { connectedAccountTokenEncryptionService } = buildServices({
        ENCRYPTION_KEY: KEY_X,
      });

      const { encryptedAccessToken, encryptedRefreshToken } =
        connectedAccountTokenEncryptionService.encryptTokenPair({
          accessToken: 'access',
          refreshToken: 'refresh',
          workspaceId: WORKSPACE_ID,
        });

      expect(isDefined(encryptedRefreshToken)).toBe(true);
      expect(
        connectedAccountTokenEncryptionService.decrypt(
          encryptedAccessToken,
          WORKSPACE_ID,
        ),
      ).toBe('access');
      expect(
        connectedAccountTokenEncryptionService.decrypt(
          encryptedRefreshToken as string,
          WORKSPACE_ID,
        ),
      ).toBe('refresh');
    });

    it('survives rotation: tokens encrypted before rotation decrypt after rotation via the fallback', () => {
      const { connectedAccountTokenEncryptionService: pre } = buildServices({
        APP_SECRET: KEY_X,
      });

      const { encryptedAccessToken: preRotationAccessToken } =
        pre.encryptTokenPair({
          accessToken: 'access',
          refreshToken: null,
          workspaceId: WORKSPACE_ID,
        });

      const { connectedAccountTokenEncryptionService: post } = buildServices({
        ENCRYPTION_KEY: KEY_Y,
        FALLBACK_ENCRYPTION_KEY: KEY_X,
      });

      expect(post.decrypt(preRotationAccessToken, WORKSPACE_ID)).toBe('access');
    });

    it('rejects double-encryption: refuses to encrypt a value that already looks like an envelope', () => {
      const { connectedAccountTokenEncryptionService } = buildServices({
        ENCRYPTION_KEY: KEY_X,
      });

      const alreadyEncrypted = connectedAccountTokenEncryptionService.encrypt(
        'plain',
        WORKSPACE_ID,
      );

      expect(() =>
        connectedAccountTokenEncryptionService.encrypt(
          alreadyEncrypted,
          WORKSPACE_ID,
        ),
      ).toThrow(
        expect.objectContaining({
          code: SecretEncryptionExceptionCode.ALREADY_ENCRYPTED,
        }),
      );
    });

    it('tolerates plaintext tokens during the rollout window (logs but does not throw)', () => {
      const { connectedAccountTokenEncryptionService } = buildServices({
        APP_SECRET: KEY_APP_SECRET,
      });

      expect(
        connectedAccountTokenEncryptionService.decrypt(
          'raw-plaintext-no-prefix',
          WORKSPACE_ID,
        ),
      ).toBe('raw-plaintext-no-prefix');
    });
  });
});
