import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

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

  encrypt({
    plaintext,
    workspaceId,
  }: {
    plaintext: string;
    workspaceId: string;
  }): string {
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

  encryptNullable({
    plaintext,
    workspaceId,
  }: {
    plaintext: string | null;
    workspaceId: string;
  }): string | null {
    if (!isDefined(plaintext)) {
      return null;
    }

    return this.encrypt({ plaintext, workspaceId });
  }

  // v2.4.0 rollout-window tolerance: rows written before the encryption
  // backfill ran may still be plaintext. Returning them as-is lets the slow
  // command finish; once it has run everywhere this branch can throw.
  decrypt({
    ciphertext,
    workspaceId,
  }: {
    ciphertext: string;
    workspaceId: string;
  }): string {
    const parsed = parseSecretEncryptionEnvelopeOrThrow({ value: ciphertext });

    if (!isDefined(parsed.version)) {
      this.logger.warn(
        'Decrypted a legacy plaintext token. Expected during the rollout window until the slow instance command finishes backfilling.',
      );

      return ciphertext;
    }

    return this.secretEncryptionService.decryptVersioned(ciphertext, {
      workspaceId,
    });
  }

  decryptNullable({
    ciphertext,
    workspaceId,
  }: {
    ciphertext: string | null;
    workspaceId: string;
  }): string | null {
    if (!isDefined(ciphertext)) {
      return null;
    }

    return this.decrypt({ ciphertext, workspaceId });
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
      encryptedAccessToken: this.encrypt({
        plaintext: accessToken,
        workspaceId,
      }),
      encryptedRefreshToken: this.encryptNullable({
        plaintext: refreshToken,
        workspaceId,
      }),
    };
  }

  private looksLikeCiphertext(value: string): boolean {
    try {
      const parsed = parseSecretEncryptionEnvelopeOrThrow({ value });

      return parsed.version === 2;
    } catch {
      return false;
    }
  }
}
