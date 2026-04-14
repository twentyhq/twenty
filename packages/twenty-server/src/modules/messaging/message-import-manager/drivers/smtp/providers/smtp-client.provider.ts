import { Injectable } from '@nestjs/common';

import { createTransport, type Transporter } from 'nodemailer';
import { isDefined } from 'twenty-shared/utils';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class SmtpClientProvider {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  public async getSmtpClient(
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'connectionParameters' | 'handle' | 'provider' | 'accessToken'
    >,
  ): Promise<Transporter> {
    const smtpParams = connectedAccount.connectionParameters?.SMTP;

    if (!isDefined(smtpParams)) {
      throw new Error('SMTP settings not configured for this account');
    }

    const validatedSmtpHost =
      await this.secureHttpClientService.getValidatedHost(smtpParams.host);

    const auth = {
      user: smtpParams.username ?? connectedAccount.handle ?? '',
    } as any;

    if (
      connectedAccount.provider === ConnectedAccountProvider.GOOGLE ||
      connectedAccount.provider === ConnectedAccountProvider.MICROSOFT
    ) {
      auth.type = 'OAuth2';
      auth.accessToken = connectedAccount.accessToken;
    } else {
      auth.pass = smtpParams.password;
    }

    const options: SMTPConnection.Options = {
      host: validatedSmtpHost,
      port: smtpParams.port,
      auth,
      tls: {
        rejectUnauthorized: true,
      },
    };

    const transporter = createTransport(options);

    return transporter;
  }
}
