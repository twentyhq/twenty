import { Injectable, Logger } from '@nestjs/common';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

export const CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX = 'enc:v1:';

@Injectable()
export class ConnectedAccountTokenEncryptionService {
  private readonly logger = new Logger(
    ConnectedAccountTokenEncryptionService.name,
  );

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
      // v2.4.0 deployment-window tolerance. Should be patch to throw after v2.4.1
      // throw new Error(
      //   'ConnectedAccountTokenEncryptionService.decrypt received a value without the ' +
      //     `'${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}' prefix. ` +
      //     'This indicates the column was written without going through encrypt(), ' +
      //     'or the value was read from a source other than core.connectedAccount.',
      // );

      this.logger.warn(
        'Decrypted a legacy plaintext token. Expected during the 2.4.0 ' +
          'rollout window until the slow instance command finishes backfilling.',
      );

      return ciphertext;
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

  encryptTokenPair({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string | null;
  }): {
    encryptedAccessToken: string;
    encryptedRefreshToken: string | null;
  } {
    return {
      encryptedAccessToken: this.encrypt(accessToken),
      encryptedRefreshToken: this.encryptNullable(refreshToken),
    };
  }
}
