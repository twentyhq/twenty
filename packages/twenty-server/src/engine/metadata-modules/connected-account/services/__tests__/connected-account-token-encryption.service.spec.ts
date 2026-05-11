import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import {
  CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX,
  ConnectedAccountTokenEncryptionService,
} from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

describe('ConnectedAccountTokenEncryptionService', () => {
  // Recognizable, deterministic stub for SecretEncryptionService — keeps the
  // assertions about prefix handling decoupled from real AES output (those
  // guarantees live in SecretEncryptionService's own spec).
  const buildFakeSecretEncryptionService = (): SecretEncryptionService =>
    ({
      encrypt: jest.fn((value: string): string => `CIPHER(${value})`),
      decrypt: jest.fn((value: string): string => {
        const match = value.match(/^CIPHER\((.*)\)$/);

        if (match === null) {
          throw new Error(
            `fakeSecretEncryptionService.decrypt called with non-CIPHER input: ${value}`,
          );
        }

        return match[1];
      }),
    }) as unknown as SecretEncryptionService;

  const buildEncryptionService = (): {
    encryptionService: ConnectedAccountTokenEncryptionService;
    secretEncryptionService: SecretEncryptionService;
  } => {
    const secretEncryptionService = buildFakeSecretEncryptionService();
    const encryptionService = new ConnectedAccountTokenEncryptionService(
      secretEncryptionService,
    );

    return { encryptionService, secretEncryptionService };
  };

  describe('encrypt', () => {
    it('should prepend the enc:v1: prefix to the SecretEncryptionService output', () => {
      const { encryptionService } = buildEncryptionService();

      expect(encryptionService.encrypt('plaintext-token')).toBe(
        `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(plaintext-token)`,
      );
    });

    // Critical safety guard: re-encrypting an already-prefixed value would
    // corrupt the column (`enc:v1:CIPHER(enc:v1:CIPHER(...))`) and silently
    // succeed at the schema level. The throw turns it into a loud bug at the
    // first attempted re-encrypt.
    it('should throw when given an already-prefixed value', () => {
      const { encryptionService, secretEncryptionService } =
        buildEncryptionService();

      expect(() =>
        encryptionService.encrypt(
          `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}already-encrypted`,
        ),
      ).toThrow(/already-prefixed/);

      // Bonus: the underlying SecretEncryptionService.encrypt was never even
      // called — the guard runs before any crypto work.
      expect(secretEncryptionService.encrypt).not.toHaveBeenCalled();
    });
  });

  describe('encryptNullable', () => {
    it('should pass null through unchanged', () => {
      const { encryptionService, secretEncryptionService } =
        buildEncryptionService();

      expect(encryptionService.encryptNullable(null)).toBeNull();
      expect(secretEncryptionService.encrypt).not.toHaveBeenCalled();
    });

    it('should encrypt non-null values like encrypt()', () => {
      const { encryptionService } = buildEncryptionService();

      expect(encryptionService.encryptNullable('plaintext')).toBe(
        `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(plaintext)`,
      );
    });
  });

  describe('decrypt', () => {
    it('should strip the prefix and delegate to SecretEncryptionService', () => {
      const { encryptionService } = buildEncryptionService();

      expect(
        encryptionService.decrypt(
          `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(some-token)`,
        ),
      ).toBe('some-token');
    });

    it('should roundtrip cleanly with encrypt()', () => {
      const { encryptionService } = buildEncryptionService();

      const plaintext = 'roundtrip-token-value';
      const ciphertext = encryptionService.encrypt(plaintext);

      expect(encryptionService.decrypt(ciphertext)).toBe(plaintext);
    });

    // Critical safety guard: AES-256-CTR is unauthenticated. Decrypting a
    // plaintext value (no prefix) would silently return garbled bytes rather
    // than failing — which is exactly the silent-corruption mode the prefix
    // exists to prevent. Throwing on missing prefix turns that into a loud
    // contract violation.
    it('should throw when given a value without the enc:v1: prefix', () => {
      const { encryptionService, secretEncryptionService } =
        buildEncryptionService();

      expect(() =>
        encryptionService.decrypt('raw-plaintext-without-prefix'),
      ).toThrow(/prefix/);

      expect(secretEncryptionService.decrypt).not.toHaveBeenCalled();
    });
  });

  describe('decryptNullable', () => {
    it('should pass null through unchanged', () => {
      const { encryptionService, secretEncryptionService } =
        buildEncryptionService();

      expect(encryptionService.decryptNullable(null)).toBeNull();
      expect(secretEncryptionService.decrypt).not.toHaveBeenCalled();
    });

    it('should decrypt non-null values like decrypt()', () => {
      const { encryptionService } = buildEncryptionService();

      expect(
        encryptionService.decryptNullable(
          `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(rt-value)`,
        ),
      ).toBe('rt-value');
    });
  });

  describe('encryptTokenPair', () => {
    it('should encrypt both tokens and return them keyed as encrypted*', () => {
      const { encryptionService } = buildEncryptionService();

      expect(
        encryptionService.encryptTokenPair({
          accessToken: 'at-plaintext',
          refreshToken: 'rt-plaintext',
        }),
      ).toEqual({
        encryptedAccessToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(at-plaintext)`,
        encryptedRefreshToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(rt-plaintext)`,
      });
    });

    // The OAuth provider response can omit refreshToken on subsequent grants
    // (the IDP doesn't always reissue one). The pair API has to handle that
    // without forcing the caller to fall back to the granular methods.
    it('should pass a null refreshToken through unencrypted', () => {
      const { encryptionService } = buildEncryptionService();

      expect(
        encryptionService.encryptTokenPair({
          accessToken: 'at-plaintext',
          refreshToken: null,
        }),
      ).toEqual({
        encryptedAccessToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(at-plaintext)`,
        encryptedRefreshToken: null,
      });
    });

    // Same safety guard as encrypt(): a caller passing already-prefixed
    // ciphertext into the pair API would corrupt the column. The throw on the
    // accessToken side propagates out of the pair call unchanged.
    it('should throw when accessToken is already encrypted', () => {
      const { encryptionService } = buildEncryptionService();

      expect(() =>
        encryptionService.encryptTokenPair({
          accessToken: `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}already-encrypted`,
          refreshToken: 'rt-plaintext',
        }),
      ).toThrow(/already-prefixed/);
    });
  });
});
