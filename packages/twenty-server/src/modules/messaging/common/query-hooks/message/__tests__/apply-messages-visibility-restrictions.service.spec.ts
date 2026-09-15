import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { MessageChannelVisibility } from 'twenty-shared/types';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const APPLICATION_ID = '44444444-4444-4444-8444-444444444444';
const MESSAGE_ID = '77777777-7777-4777-8777-777777777777';
const MESSAGE_CHANNEL_ID = '55555555-5555-4555-8555-555555555555';

describe('ApplyMessagesVisibilityRestrictionsService', () => {
  let service: ApplyMessagesVisibilityRestrictionsService;
  let connectedAccountRepository: { find: jest.Mock };
  let messageChannelRepository: { find: jest.Mock };

  const aMessage = (): MessageWorkspaceEntity =>
    ({
      id: MESSAGE_ID,
      subject: 'Coffee tomorrow?',
      text: 'Are you free at 3?',
    }) as unknown as MessageWorkspaceEntity;

  beforeEach(async () => {
    connectedAccountRepository = { find: jest.fn().mockResolvedValue([]) };
    messageChannelRepository = {
      find: jest.fn().mockResolvedValue([
        {
          id: MESSAGE_CHANNEL_ID,
          visibility: MessageChannelVisibility.METADATA,
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplyMessagesVisibilityRestrictionsService,
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: (callback: () => unknown) => callback(),
            getRepository: () => ({
              find: jest.fn().mockResolvedValue([
                {
                  messageId: MESSAGE_ID,
                  messageChannelId: MESSAGE_CHANNEL_ID,
                },
              ]),
            }),
          },
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: messageChannelRepository,
        },
      ],
    }).compile();

    service = module.get(ApplyMessagesVisibilityRestrictionsService);
  });

  // An application has no user behind it, so before this bypass existed it fell
  // straight through to the redaction branches and read back placeholders
  // instead of the messages it had just written.
  it('does not redact a channel owned by the calling application', async () => {
    connectedAccountRepository.find.mockResolvedValue([
      { id: 'connected-account-id', applicationId: APPLICATION_ID },
    ]);

    const [message] = await service.applyMessagesVisibilityRestrictions(
      [aMessage()],
      WORKSPACE_ID,
      undefined,
      APPLICATION_ID,
    );

    expect(message.subject).toBe('Coffee tomorrow?');
    expect(message.text).toBe('Are you free at 3?');
    expect(connectedAccountRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          applicationId: APPLICATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
      }),
    );
  });

  // The bypass keys on the connection carrying this application's id, so a
  // channel belonging to someone else stays redacted.
  it('still redacts a channel the calling application does not own', async () => {
    connectedAccountRepository.find.mockResolvedValue([]);

    const [message] = await service.applyMessagesVisibilityRestrictions(
      [aMessage()],
      WORKSPACE_ID,
      undefined,
      APPLICATION_ID,
    );

    expect(message.subject).toBe(
      FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    );
    expect(message.text).toBe(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED);
  });

  it('leaves the email path alone when no application is calling', async () => {
    const [message] = await service.applyMessagesVisibilityRestrictions(
      [aMessage()],
      WORKSPACE_ID,
    );

    expect(connectedAccountRepository.find).not.toHaveBeenCalled();
    expect(message.subject).toBe(
      FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    );
  });
});
