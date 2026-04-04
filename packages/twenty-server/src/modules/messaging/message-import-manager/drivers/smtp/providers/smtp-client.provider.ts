import { Injectable } from '@nestjs/common';

import { createTransport, type Transporter } from 'nodemailer';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class SmtpClientProvider {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  public async getSmtpClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      | 'connectionParameters'
      | 'handle'
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
    >,
  ): Promise<Transporter> {
    const smtpParams = connectedAccount.connectionParameters?.SMTP;

    if (!isDefined(smtpParams)) {
      throw new Error('SMTP settings not configured for this account');
    }

    const { host, port, username, password } = smtpParams;

    const validatedSmtpHost =
      await this.secureHttpClientService.getValidatedHost(host);

    const auth: { user: string; pass?: string; accessToken?: string; type?: string } = {
      user: username ?? connectedAccount.handle ?? '',
    };

    if (
      (connectedAccount.provider === ConnectedAccountProvider.GOOGLE ||
        connectedAccount.provider === ConnectedAccountProvider.MICROSOFT) &&
      isDefined(connectedAccount.accessToken)
    ) {
      auth.type = 'OAuth2';
      auth.accessToken = connectedAccount.accessToken as string;
    } else {
      auth.pass = password;
    }

    const options: SMTPConnection.Options = {
      host: validatedSmtpHost,
      port,
      auth,
      tls: {
        rejectUnauthorized: false,
      },
    };

    const transporter = createTransport(options);

    return transporter;
  }
}
