import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { ConnectedAccountProvider } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  microsoftGraphBatchWithHtmlMessagesResponse,
  microsoftGraphBatchWithTwoMessagesResponse,
} from 'src/modules/messaging/message-import-manager/drivers/microsoft/mocks/microsoft-api-examples';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';

import { MicrosoftHandleErrorService } from './microsoft-handle-error.service';

describe('Microsoft get messages service', () => {
  let service: MicrosoftGetMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvironmentModule.forRoot({})],
      providers: [
        MicrosoftGetMessagesService,
        MicrosoftHandleErrorService,
        MicrosoftClientProvider,
        MicrosoftOAuth2ClientManagerService,
        MicrosoftFetchByBatchService,
        ConfigService,
      ],
    }).compile();

    service = module.get<MicrosoftGetMessagesService>(
      MicrosoftGetMessagesService,
    );
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should format batch responses as messages', () => {
    const batchResponses = microsoftGraphBatchWithTwoMessagesResponse;
    const connectedAccount = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
      refreshToken: 'refresh-token',
      handle: 'John.l@outlook.fr',
      handleAliases: '',
    };
    const messages = service.formatBatchResponsesAsMessages(
      batchResponses,
      connectedAccount,
    );

    expect(messages).toHaveLength(2);
    expect(
      messages.find(
        (message) =>
          message.externalId ===
          'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
      ),
    ).toStrictEqual({
      externalId:
        'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
      subject: 'test email John: number 4',
      receivedAt: new Date('2025-01-10T13:31:37.000Z'),
      text: 'plain text format test 4',
      headerMessageId:
        '<FRZP194MB2383FF1CFE426952F85B1110981C3@FRAP194MB2383.EURP194.PROD.OUTLOOK.COM>',
      messageThreadExternalId:
        'AAQkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAQAAZhOZ86nXZElRkxyGJRiY8=',
      direction: 'OUTGOING',
      participants: [
        {
          displayName: 'John l',
          handle: 'john.l@outlook.fr',
          role: 'from',
        },
        {
          displayName: 'Walker',
          handle: 'walker@felixacme.onmicrosoft.com',
          role: 'to',
        },
      ],
      attachments: [],
    });
    expect(
      messages.filter(
        (message) =>
          message.externalId ===
          'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAA8ZAfgAA',
      )[0],
    ).toStrictEqual({
      externalId:
        'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAA8ZAfgAA',
      subject: 'test subject',
      receivedAt: new Date('2025-01-13T09:38:06.000Z'),
      text: 'You will send a message in the plain text format',
      headerMessageId:
        '<dfe8ac36-cf4c-4842-a506-034548452966@az.westus2.microsoft.com>',
      messageThreadExternalId:
        'AAQkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAQADz34qcnxpxEidnAJbZA-OI=',
      direction: 'INCOMING',
      participants: [
        {
          displayName: 'Microsoft',
          handle: 'microsoft-noreply@microsoft.com',
          role: 'from',
        },
        {
          displayName: 'Walker',
          handle: 'walker@felixacme.onmicrosoft.com',
          role: 'to',
        },
        {
          displayName: 'Antoine',
          handle: 'antoine@gmail.com',
          role: 'cc',
        },
        {
          displayName: 'Cyril@acme2.com',
          handle: 'cyril@acme2.com',
          role: 'cc',
        },
      ],
      attachments: [],
    });
  });

  it('Should set empty text for html responses', () => {
    const batchResponses = microsoftGraphBatchWithHtmlMessagesResponse;
    const connectedAccount = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
      refreshToken: 'refresh-token',
      handle: 'John.l@outlook.fr',
      handleAliases: '',
    };
    const messages = service.formatBatchResponsesAsMessages(
      batchResponses,
      connectedAccount,
    );

    expect(messages[0]).toStrictEqual({
      externalId:
        'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
      subject: 'test email John: number 5',
      receivedAt: new Date('2025-01-10T13:31:37.000Z'),
      text: '',
      headerMessageId:
        '<FRZP194MB2383FF1CFE426952F85B1110981C3@FRAP194MB2383.EURP194.PROD.OUTLOOK.COM>',
      messageThreadExternalId:
        'AAQkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAQAAZhOZ86nXZElRkxyGJRiY9=',
      direction: 'OUTGOING',
      participants: [
        {
          displayName: 'John l',
          handle: 'john.l@outlook.fr',
          role: 'from',
        },
      ],
      attachments: [],
    });
  });
});
