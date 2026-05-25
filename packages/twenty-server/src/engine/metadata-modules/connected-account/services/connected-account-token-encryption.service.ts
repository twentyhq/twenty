import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  type ConnectionParameters,
  type ImapSmtpCaldavParams,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { SECRET_ENCRYPTION_ENVELOPE_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ACCOUNT_TYPES } from 'twenty-shared/constants';

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

  decrypt({
    ciphertext,
    workspaceId,
  }: {
    ciphertext: string;
    workspaceId: string;
  }): string {
    if (!ciphertext.startsWith(SECRET_ENCRYPTION_ENVELOPE_PREFIX)) {
      throw new SecretEncryptionException(
        'Received a plaintext value where ciphertext was expected. The encryption backfill migration may not have run.',
        SecretEncryptionExceptionCode.MALFORMED_ENVELOPE,
      );
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
    return value.startsWith(SECRET_ENCRYPTION_ENVELOPE_PREFIX);
  }

  encryptConnectionParameters({
    connectionParameters,
    workspaceId,
  }: {
    connectionParameters: ImapSmtpCaldavParams;
    workspaceId: string;
  }): ImapSmtpCaldavParams {
    const result: ImapSmtpCaldavParams = {};

    for (const protocol of ACCOUNT_TYPES) {
      const params = connectionParameters[protocol];

      if (!isDefined(params)) {
        continue;
      }

      result[protocol] = {
        ...params,
        password: this.encrypt({ plaintext: params.password, workspaceId }),
      };
    }

    return result;
  }

  decryptConnectionParameters({
    connectionParameters,
    workspaceId,
  }: {
    connectionParameters: ImapSmtpCaldavParams;
    workspaceId: string;
  }): ImapSmtpCaldavParams {
    const result: ImapSmtpCaldavParams = {};

    for (const protocol of ACCOUNT_TYPES) {
      const params = connectionParameters[protocol];

      if (!isDefined(params)) {
        continue;
      }

      result[protocol] = this.decryptProtocolPassword({
        protocolParams: params,
        workspaceId,
      });
    }

    return result;
  }

  decryptProtocolPassword({
    protocolParams,
    workspaceId,
  }: {
    protocolParams: ConnectionParameters;
    workspaceId: string;
  }): ConnectionParameters {
    const isEncrypted = protocolParams.password.startsWith(
      SECRET_ENCRYPTION_ENVELOPE_PREFIX,
    );

    // TODO: Remove after 2-5 slow instance command has been run everywhere
    if (!isEncrypted) {
      this.logger.warn(
        'Protocol password is not encrypted. Expected during the rollout window until the slow instance command finishes backfilling.',
      );

      return protocolParams;
    }

    return {
      ...protocolParams,
      password: this.decrypt({
        ciphertext: protocolParams.password,
        workspaceId,
      }),
    };
  }
}
