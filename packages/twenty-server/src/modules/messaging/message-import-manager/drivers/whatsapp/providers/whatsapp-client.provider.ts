import { Injectable, Logger } from '@nestjs/common';

import axios, { type AxiosInstance } from 'axios';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

type ConnectedAccountIdentifier = Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'accessToken' | 'handle'
>;

@Injectable()
export class WhatsAppClientProvider {
  private readonly logger = new Logger(WhatsAppClientProvider.name);
  private readonly WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

  async getClient(
    connectedAccount: ConnectedAccountIdentifier,
  ): Promise<AxiosInstance> {
    if (connectedAccount.provider !== ConnectedAccountProvider.WHATSAPP) {
      throw new Error('Connected account is not a WhatsApp provider');
    }

    if (!isDefined(connectedAccount.accessToken)) {
      throw new Error('WhatsApp access token is required');
    }

    const client = axios.create({
      baseURL: this.WHATSAPP_API_URL,
      headers: {
        Authorization: `Bearer ${connectedAccount.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(
          `WhatsApp API error for account ${connectedAccount.id}:  ${error.message}`,
          error.response?.data,
        );
        throw error;
      },
    );

    return client;
  }
}
