import { Injectable } from '@nestjs/common';

import { createTransport, Transporter } from 'nodemailer';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class SmtpClientProvider {
  public async getSmtpClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'connectionParameters' | 'handle'
    >,
  ): Promise<Transporter> {
    const smtpParams = connectedAccount.connectionParameters?.SMTP;

    if (!smtpParams) {
      throw new Error('SMTP settings not configured for this account');
    }

    const transporter = createTransport({
      host: smtpParams.host,
      port: smtpParams.port,
      auth: {
        user: connectedAccount.handle,
        pass: smtpParams.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return transporter;
  }
}
