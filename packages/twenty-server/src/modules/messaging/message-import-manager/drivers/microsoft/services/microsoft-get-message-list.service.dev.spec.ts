import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { ConnectedAccountProvider } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';

import { MicrosoftGetMessageListService } from './microsoft-get-message-list.service';
import { MicrosoftHandleErrorService } from './microsoft-handle-error.service';

const refreshToken = 'replace-with-your-refresh-token';
const syncCursor = `replace-with-your-sync-cursor`;

xdescribe('Microsoft dev tests : get message list service', () => {
  let service: MicrosoftGetMessageListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvironmentModule.forRoot({})],
      providers: [
        MicrosoftGetMessageListService,
        MicrosoftClientProvider,
        MicrosoftHandleErrorService,
        MicrosoftOAuth2ClientManagerService,
        ConfigService,
      ],
    }).compile();

    service = module.get<MicrosoftGetMessageListService>(
      MicrosoftGetMessageListService,
    );
  });

  const mockConnectedAccount = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.MICROSOFT,
    refreshToken: refreshToken,
  };

  it('Should fetch and return message list successfully', async () => {
    const result = await service.getFullMessageList(mockConnectedAccount);

    expect(result.messageExternalIds.length).toBeGreaterThan(0);
  });

  it('Should throw token error', async () => {
    const mockConnectedAccountUnvalid = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
      refreshToken: 'invalid-token',
    };

    await expect(
      service.getFullMessageList(mockConnectedAccountUnvalid),
    ).rejects.toThrowError('Access token is undefined or empty');
  });

  it('Should fetch and return partial message list successfully', async () => {
    const result = await service.getPartialMessageList(
      mockConnectedAccount,
      syncCursor,
    );

    expect(result.nextSyncCursor).toBeTruthy();
  });

  it('Should fail partial message if syncCursor is invalid', async () => {
    await expect(
      service.getPartialMessageList(mockConnectedAccount, 'invalid-syncCursor'),
    ).rejects.toThrowError(
      /Resource not found for the segment|Badly formed content/g,
    );
  });

  it('Should fail partial message if syncCursor is missing', async () => {
    await expect(
      service.getPartialMessageList(mockConnectedAccount, ''),
    ).rejects.toThrowError(/Missing SyncCursor/g);
  });
});
