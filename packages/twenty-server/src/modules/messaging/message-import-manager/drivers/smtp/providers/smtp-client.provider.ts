import { Injectable } from '@nestjs/common';

import { createTransport, type Transporter } from 'nodemailer';
import { isDefined } from 'twenty-shared/utils';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

@Injectable()
export class SmtpClientProvider {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  public async getSmtpClient(
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'connectionParameters' | 'handle' | 'workspaceId'
    >,
  ): Promise<Transporter> {
    const smtpParams = connectedAccount.connectionParameters?.SMTP;

    if (!isDefined(smtpParams)) {
      throw new Error('SMTP settings not configured for this account');
    }

    const decryptedPassword =
      this.connectedAccountTokenEncryptionService.decrypt({
        ciphertext: smtpParams.password,
        workspaceId: connectedAccount.workspaceId,
      });

    const validatedSmtpHost =
      await this.secureHttpClientService.getValidatedHost(smtpParams.host);

    const options: SMTPConnection.Options = {
      host: validatedSmtpHost,
      port: smtpParams.port,
      auth: {
        user: smtpParams.username ?? connectedAccount.handle ?? '',
        pass: decryptedPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    const transporter = createTransport(options);

    return transporter;
  }
}
