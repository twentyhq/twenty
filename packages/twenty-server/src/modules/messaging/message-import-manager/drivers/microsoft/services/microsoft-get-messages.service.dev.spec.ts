import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { ConnectedAccountProvider } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';

import { MicrosoftHandleErrorService } from './microsoft-handle-error.service';

const mockMessageIds = [
  'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAA8ZAfgAA',
  'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
];

const refreshToken = 'replace-with-your-refresh-token';

xdescribe('Microsoft dev tests : get messages service', () => {
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

  const mockConnectedAccount = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.MICROSOFT,
    handle: 'John.Walker@outlook.fr',
    handleAliases: '',
    refreshToken: refreshToken,
  };

  it('should fetch and format messages successfully', async () => {
    const result = await service.getMessages(
      mockMessageIds,
      mockConnectedAccount,
      'workspace-1',
    );

    expect(result).toHaveLength(1);
  });
});
