import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  ConnectedAccountProvider,
  MessageParticipantRole,
} from 'twenty-shared/types';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import {
  microsoftGraphBatchWithHtmlMessagesResponse,
  microsoftGraphBatchWithTwoMessagesResponse,
} from 'src/modules/messaging/message-import-manager/drivers/microsoft/mocks/microsoft-api-examples';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { type MicrosoftGraphBatchResponse } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.interface';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import { MicrosoftMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-messages-import-error-handler.service';

describe('Microsoft get messages service', () => {
  let service: MicrosoftGetMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicrosoftGetMessagesService,
        {
          provide: MicrosoftMessagesImportErrorHandler,
          useValue: { handleError: jest.fn() },
        },
        OAuth2ClientManagerService,
        GoogleOAuth2ClientManagerService,
        MicrosoftOAuth2ClientManagerService,
        MicrosoftFetchByBatchService,
        ConfigService,
        {
          provide: TwentyConfigService,
          useValue: {},
        },
        {
          provide: Logger,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MicrosoftGetMessagesService>(
      MicrosoftGetMessagesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should format batch responses as messages', () => {
    const batchResponses: MicrosoftGraphBatchResponse[] =
      microsoftGraphBatchWithTwoMessagesResponse;
    const connectedAccount = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      handle: 'John.l@outlook.fr',
      handleAliases: '',
    };
    const messages = service.formatBatchResponsesAsMessages(
      batchResponses,
      connectedAccount,
    );

    expect(messages).toHaveLength(2);

    const responseExample1 =
      microsoftGraphBatchWithTwoMessagesResponse[0].responses[0];

    expect(
      messages.find(
        (message) =>
          message.externalId ===
          'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
      ),
    ).toStrictEqual({
      externalId:
        'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
      subject: responseExample1.body.subject,
      receivedAt: new Date(responseExample1.body.receivedDateTime),
      text: responseExample1.body.body.content,
      headerMessageId: responseExample1.body.internetMessageId,
      messageThreadExternalId: responseExample1.body.conversationId,
      direction: 'OUTGOING',
      participants: [
        {
          displayName: 'John l',
          handle: 'john.l@outlook.fr',
          role: MessageParticipantRole.FROM,
        },
        {
          displayName: 'Walker',
          handle: 'walker@felixacme.onmicrosoft.com',
          role: MessageParticipantRole.TO,
        },
      ],
      attachments: [],
    });

    const responseExample2 =
      microsoftGraphBatchWithTwoMessagesResponse[0].responses[1];

    expect(
      messages.filter(
        (message) =>
          message.externalId ===
          'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAA8ZAfgAA',
      )[0],
    ).toStrictEqual({
      externalId:
        'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAA8ZAfgAA',
      subject: responseExample2.body.subject,
      receivedAt: new Date(responseExample2.body.receivedDateTime),
      text: responseExample2.body.body.content,
      headerMessageId: responseExample2.body.internetMessageId,
      messageThreadExternalId: responseExample2.body.conversationId,
      direction: 'INCOMING',
      participants: [
        {
          displayName: 'Microsoft',
          handle: 'microsoft-noreply@microsoft.com',
          role: MessageParticipantRole.FROM,
        },
        {
          displayName: 'Walker',
          handle: 'walker@felixacme.onmicrosoft.com',
          role: MessageParticipantRole.TO,
        },
        {
          displayName: 'Antoine',
          handle: 'antoine@gmail.com',
          role: MessageParticipantRole.CC,
        },
        {
          displayName: 'Cyril@acme2.com',
          handle: 'cyril@acme2.com',
          role: MessageParticipantRole.CC,
        },
      ],
      attachments: [],
    });
  });

  it('Should set empty text for html responses', () => {
    const batchResponses: MicrosoftGraphBatchResponse[] =
      microsoftGraphBatchWithHtmlMessagesResponse;
    const connectedAccount = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      handle: 'John.l@outlook.fr',
      handleAliases: '',
    };
    const messages = service.formatBatchResponsesAsMessages(
      batchResponses,
      connectedAccount,
    );

    const responseExample =
      microsoftGraphBatchWithHtmlMessagesResponse[0].responses[0];

    expect(messages[0]).toStrictEqual({
      externalId: responseExample.body.id,
      subject: responseExample.body.subject,
      receivedAt: new Date(responseExample.body.receivedDateTime),
      text: '',
      headerMessageId: responseExample.body.internetMessageId,
      messageThreadExternalId: responseExample.body.conversationId,
      direction: 'OUTGOING',
      participants: [
        {
          displayName: responseExample.body.sender.emailAddress.name,
          handle:
            responseExample.body.sender.emailAddress.address.toLowerCase(),
          role: MessageParticipantRole.FROM,
        },
      ],
      attachments: [],
    });
  });
});
