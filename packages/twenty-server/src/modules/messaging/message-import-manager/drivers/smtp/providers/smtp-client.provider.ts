import { Injectable } from '@nestjs/common';

import { createTransport, type Transporter } from 'nodemailer';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class SmtpClientProvider {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
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
    const isGoogle = connectedAccount.provider === ConnectedAccountProvider.GOOGLE;
    const isMicrosoft = connectedAccount.provider === ConnectedAccountProvider.MICROSOFT;

    let host = '';
    let port = 0;
    let username = '';
    let password = '';

    if (isGoogle) {
      host = 'smtp.gmail.com';
      port = 465;
    } else if (isMicrosoft) {
      host = 'smtp.office365.com';
      port = 587;
    } else {
      const smtpParams = connectedAccount.connectionParameters?.SMTP;

      if (!isDefined(smtpParams)) {
        throw new Error('SMTP settings not configured for this account');
      }

      const { host: smtpHost, port: smtpPort, username: smtpUsername, password: smtpPassword } = smtpParams as any;

      host = smtpHost;
      port = smtpPort;
      username = smtpUsername;
      password = smtpPassword;
    }

    const validatedSmtpHost =
      await this.secureHttpClientService.getValidatedHost(host);

    const auth: { 
      user: string; 
      pass?: string; 
      accessToken?: string; 
      type?: string;
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
    } = {
      user: isGoogle || isMicrosoft ? connectedAccount.handle ?? '' : username,
    };

    if (isGoogle && isDefined(connectedAccount.accessToken)) {
      auth.type = 'OAuth2';
      auth.accessToken = connectedAccount.accessToken as string;
      if (isDefined(connectedAccount.refreshToken)) {
        auth.refreshToken = connectedAccount.refreshToken as string;
        auth.clientId = this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID') as string;
        auth.clientSecret = this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_SECRET') as string;
      }
    } else if (isMicrosoft && isDefined(connectedAccount.accessToken)) {
      auth.type = 'OAuth2';
      auth.accessToken = connectedAccount.accessToken as string;
      if (isDefined(connectedAccount.refreshToken)) {
        auth.refreshToken = connectedAccount.refreshToken as string;
        auth.clientId = this.twentyConfigService.get('AUTH_MICROSOFT_CLIENT_ID') as string;
        auth.clientSecret = this.twentyConfigService.get('AUTH_MICROSOFT_CLIENT_SECRET') as string;
      }
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
