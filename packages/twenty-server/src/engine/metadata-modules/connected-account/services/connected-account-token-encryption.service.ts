import { Injectable } from '@nestjs/common';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

// `core.connectedAccount.{accessToken,refreshToken}` always hold ciphertext
// stamped with this prefix. The prefix is enforced by a CHECK constraint on
// both columns and by this service's invariants:
//
// - encrypt() refuses an already-prefixed value (catches double-encryption)
// - decrypt() refuses a value missing the prefix (catches "I forgot to
//   encrypt" or "I read raw column data without going through this service"
//   bugs loudly instead of silently returning garbled bytes — AES-256-CTR is
//   unauthenticated and would otherwise decrypt plaintext into noise).
//
// This service is intentionally connected-account-scoped, not a generic
// SecretToken pattern. The generic, class-based wrapper with log-redaction
// is planned as a follow-up PR; for now we localize the concern here so the
// in-flight encryption window for OAuth tokens shrinks immediately.
//
// Naming follows the existing SecretEncryptionService precedent (which this
// service composes) — same word, same shape, one tier down for the
// connected-account verticality.
export const CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX = 'enc:v1:';

@Injectable()
export class ConnectedAccountTokenEncryptionService {
  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  encrypt(plaintext: string): string {
    if (plaintext.startsWith(CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX)) {
      throw new Error(
        'ConnectedAccountTokenEncryptionService.encrypt received an already-prefixed value. ' +
          'This indicates a double-encryption bug — the caller is encrypting ciphertext.',
      );
    }

    return `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}${this.secretEncryptionService.encrypt(plaintext)}`;
  }

  encryptNullable(plaintext: string | null): string | null {
    if (plaintext === null) {
      return null;
    }

    return this.encrypt(plaintext);
  }

  decrypt(ciphertext: string): string {
    if (!ciphertext.startsWith(CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX)) {
      throw new Error(
        'ConnectedAccountTokenEncryptionService.decrypt received a value without the ' +
          `'${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}' prefix. ` +
          'This indicates the column was written without going through encrypt(), ' +
          'or the value was read from a source other than core.connectedAccount.',
      );
    }

    return this.secretEncryptionService.decrypt(
      ciphertext.slice(CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX.length),
    );
  }

  decryptNullable(ciphertext: string | null): string | null {
    if (ciphertext === null) {
      return null;
    }

    return this.decrypt(ciphertext);
  }
}
