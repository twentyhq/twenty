import { Injectable } from '@nestjs/common';

import { createTransport, type Transporter } from 'nodemailer';
import { isDefined } from 'twenty-shared/utils';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class SmtpClientProvider {
  public async getSmtpClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'connectionParameters' | 'handle'
    >,
  ): Promise<Transporter> {
    const smtpParams = connectedAccount.connectionParameters?.SMTP;

    if (!isDefined(smtpParams)) {
      throw new Error('SMTP settings not configured for this account');
    }

    const options: SMTPConnection.Options = {
      host: smtpParams.host,
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
