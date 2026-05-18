import { Injectable } from '@nestjs/common';

import { createTransport, type Transporter } from 'nodemailer';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

import { isDefined } from 'twenty-shared/utils';

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
    if (!isDefined(connectedAccount.connectionParameters?.SMTP)) {
      throw new Error('SMTP settings not configured for this account');
    }

    const smtpParams =
      this.connectedAccountTokenEncryptionService.decryptProtocolPassword({
        protocolParams: connectedAccount.connectionParameters.SMTP,
        workspaceId: connectedAccount.workspaceId,
      });

    const validatedSmtpHost =
      await this.secureHttpClientService.getValidatedHost(smtpParams.host);

    const options: SMTPConnection.Options = {
      host: validatedSmtpHost,
      port: smtpParams.port,
      auth: {
        user: smtpParams.username ?? connectedAccount.handle ?? '',
        pass: smtpParams.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    const transporter = createTransport(options);

    return transporter;
  }
}
