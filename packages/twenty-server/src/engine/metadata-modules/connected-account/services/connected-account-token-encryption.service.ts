import { Injectable, Logger } from '@nestjs/common';

import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { parseSecretEncryptionEnvelopeOrThrow } from 'src/engine/core-modules/secret-encryption/utils/parse-secret-encryption-envelope-or-throw.util';

@Injectable()
export class ConnectedAccountTokenEncryptionService {
  private readonly logger = new Logger(
    ConnectedAccountTokenEncryptionService.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  encrypt(plaintext: string, workspaceId: string): string {
    if (this.looksLikeCiphertext(plaintext)) {
      throw new SecretEncryptionException(
        'ConnectedAccountTokenEncryptionService.encrypt received an already-encrypted envelope. This indicates a double-encryption bug — the caller is encrypting ciphertext.',
        SecretEncryptionExceptionCode.ALREADY_ENCRYPTED,
      );
    }

    return this.secretEncryptionService.encryptVersioned(plaintext, {
      workspaceId,
    });
  }

  encryptNullable(
    plaintext: string | null,
    workspaceId: string,
  ): string | null {
    if (plaintext === null) {
      return null;
    }

    return this.encrypt(plaintext, workspaceId);
  }

  // v2.4.0 rollout-window tolerance: rows written before the encryption
  // backfill ran may still be plaintext. Returning them as-is lets the slow
  // command finish; once it has run everywhere this branch can throw.
  decrypt(ciphertext: string, workspaceId: string): string {
    const parsed = parseSecretEncryptionEnvelopeOrThrow({ value: ciphertext });

    if (parsed.version === null) {
      this.logger.warn(
        'Decrypted a legacy plaintext token. Expected during the rollout window until the slow instance command finishes backfilling.',
      );

      return ciphertext;
    }

    return this.secretEncryptionService.decryptVersioned(ciphertext, {
      workspaceId,
    });
  }

  decryptNullable(
    ciphertext: string | null,
    workspaceId: string,
  ): string | null {
    if (ciphertext === null) {
      return null;
    }

    return this.decrypt(ciphertext, workspaceId);
  }

  encryptTokenPair({
    accessToken,
    refreshToken,
    workspaceId,
  }: {
    accessToken: string;
    refreshToken: string | null;
    workspaceId: string;
  }): {
    encryptedAccessToken: string;
    encryptedRefreshToken: string | null;
  } {
    return {
      encryptedAccessToken: this.encrypt(accessToken, workspaceId),
      encryptedRefreshToken: this.encryptNullable(refreshToken, workspaceId),
    };
  }

  private looksLikeCiphertext(value: string): boolean {
    try {
      const parsed = parseSecretEncryptionEnvelopeOrThrow({ value });

      return parsed.version === 1 || parsed.version === 2;
    } catch {
      return false;
    }
  }
}
