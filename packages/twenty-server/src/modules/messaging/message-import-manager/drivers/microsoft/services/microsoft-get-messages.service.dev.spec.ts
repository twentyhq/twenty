import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';

import { MicrosoftMessagesImportErrorHandler } from './microsoft-messages-import-error-handler.service';

const mockMessageIds = [
  'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAA8ZAfgAA',
  'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
];

const accessToken = 'replace-with-your-access-token';
const refreshToken = 'replace-with-your-refresh-token';

xdescribe('Microsoft dev tests : get messages service', () => {
  let service: MicrosoftGetMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TwentyConfigModule.forRoot()],
      providers: [
        MicrosoftGetMessagesService,
        {
          provide: MicrosoftMessagesImportErrorHandler,
          useValue: { handleError: jest.fn() },
        },
        OAuth2ClientManagerService,
        MicrosoftOAuth2ClientManagerService,
        MicrosoftFetchByBatchService,
        ConfigService,
      ],
    }).compile();

    service = module.get<MicrosoftGetMessagesService>(
      MicrosoftGetMessagesService,
    );
  });

  const mockConnectedAccount = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.MICROSOFT,
    handle: 'John.Walker@outlook.fr',
    handleAliases: '',
    accessToken: accessToken,
    refreshToken: refreshToken,
  };

  it('should fetch and format messages successfully', async () => {
    const result = await service.getMessages(
      mockMessageIds,
      mockConnectedAccount,
    );

    expect(result).toHaveLength(1);
  });
});
