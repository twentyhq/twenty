import { Injectable, Logger } from '@nestjs/common';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import {
  ENVELOPE_PREFIX,
  parseEnvelope,
} from 'src/engine/core-modules/secret-encryption/utils/envelope.util';

@Injectable()
export class ConnectedAccountTokenEncryptionService {
  private readonly logger = new Logger(
    ConnectedAccountTokenEncryptionService.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  encrypt(plaintext: string, workspaceId: string): string {
    if (plaintext.startsWith(ENVELOPE_PREFIX)) {
      throw new Error(
        'ConnectedAccountTokenEncryptionService.encrypt received an already-prefixed value. ' +
          'This indicates a double-encryption bug — the caller is encrypting ciphertext.',
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

  decrypt(ciphertext: string, workspaceId: string): string {
    const parsed = parseEnvelope(ciphertext);

    if (parsed.version === null) {
      // v2.4.0 deployment-window tolerance: a column written before the
      // encryption rollout might still hold raw plaintext. Returning it
      // as-is lets the slow instance command finish backfilling. Once that
      // command has run on every instance, this branch can throw.
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
}
