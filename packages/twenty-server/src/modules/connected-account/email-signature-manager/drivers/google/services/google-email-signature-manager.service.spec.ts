import { Test, type TestingModule } from '@nestjs/testing';

import { GoogleEmailSignatureManagerService } from 'src/modules/connected-account/email-signature-manager/drivers/google/services/google-email-signature-manager.service';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const mockSendAsList = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    gmail: jest.fn(() => ({
      users: { settings: { sendAs: { list: mockSendAsList } } },
    })),
  },
}));

describe('GoogleEmailSignatureManagerService', () => {
  let service: GoogleEmailSignatureManagerService;

  const connectedAccount = {
    id: 'account-1',
    handle: 'jane@example.com',
  } as ConnectedAccountEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleEmailSignatureManagerService,
        {
          provide: GoogleOAuth2ClientProvider,
          useValue: { getClient: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();

    service = module.get(GoogleEmailSignatureManagerService);
  });

  it('returns the signature of the send-as matching the account handle', async () => {
    mockSendAsList.mockResolvedValue({
      data: {
        sendAs: [
          {
            sendAsEmail: 'other@example.com',
            isPrimary: false,
            signature: '<div>Other</div>',
          },
          {
            sendAsEmail: 'jane@example.com',
            isPrimary: true,
            signature: '<div>Jane</div>',
          },
        ],
      },
    });

    expect(await service.getSignature(connectedAccount)).toBe(
      '<div>Jane</div>',
    );
  });

  it('falls back to the primary send-as signature when none matches the handle', async () => {
    mockSendAsList.mockResolvedValue({
      data: {
        sendAs: [
          {
            sendAsEmail: 'primary@example.com',
            isPrimary: true,
            signature: '<div>Primary</div>',
          },
        ],
      },
    });

    expect(await service.getSignature(connectedAccount)).toBe(
      '<div>Primary</div>',
    );
  });

  it('returns undefined when the signature is empty', async () => {
    mockSendAsList.mockResolvedValue({
      data: { sendAs: [{ isPrimary: true, signature: '' }] },
    });

    expect(await service.getSignature(connectedAccount)).toBeUndefined();
  });

  it('returns undefined without throwing when the Gmail API fails', async () => {
    mockSendAsList.mockRejectedValue(
      new Error('insufficient authentication scopes'),
    );

    expect(await service.getSignature(connectedAccount)).toBeUndefined();
  });
});
