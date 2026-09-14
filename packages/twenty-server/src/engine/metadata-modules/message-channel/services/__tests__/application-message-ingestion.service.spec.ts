import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  MessageChannelType,
  MessageParticipantRole,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type AppMessageInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelExceptionCode } from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import { ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const APPLICATION_ID = '11111111-1111-4111-8111-111111111111';
const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const CONNECTED_ACCOUNT_ID = '44444444-4444-4444-8444-444444444444';
const MESSAGE_CHANNEL_ID = '55555555-5555-4555-8555-555555555555';
const CHANNEL_HANDLE = 'urn:li:person:self';

describe('ApplicationMessageIngestionService', () => {
  let service: ApplicationMessageIngestionService;
  let channelsService: jest.Mocked<ApplicationMessageChannelsService>;
  let saveMessagesService: jest.Mocked<MessagingSaveMessagesAndEnqueueContactCreationService>;
  let existingRecordIds: string[];

  const scope = {
    applicationId: APPLICATION_ID,
    workspaceId: WORKSPACE_ID,
    requestUserWorkspaceId: null,
    messageChannelId: MESSAGE_CHANNEL_ID,
  };

  const aMessage = (overrides: Partial<AppMessageInput> = {}) =>
    ({
      externalId: 'msg-1',
      threadExternalId: 'thread-1',
      text: 'hello',
      receivedAt: new Date('2026-01-01T00:00:00Z'),
      participants: [
        {
          role: MessageParticipantRole.FROM,
          handle: 'urn:li:person:ada',
          displayName: 'Ada',
        },
        { role: MessageParticipantRole.TO, handle: CHANNEL_HANDLE },
      ],
      ...overrides,
    }) as AppMessageInput;

  beforeEach(async () => {
    existingRecordIds = [];

    channelsService = {
      findOwnedOrThrow: jest.fn().mockResolvedValue({
        id: MESSAGE_CHANNEL_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        handle: CHANNEL_HANDLE,
        type: MessageChannelType.APP,
        isSyncEnabled: true,
      } as MessageChannelEntity),
    } as unknown as jest.Mocked<ApplicationMessageChannelsService>;

    saveMessagesService = {
      saveMessagesAndEnqueueContactCreation: jest.fn().mockResolvedValue({
        messageExternalIdsAndIdsMap: new Map([['msg-1', 'message-uuid']]),
        messageExternalIdToMessageThreadIdMap: new Map([
          ['msg-1', 'thread-uuid'],
        ]),
      }),
    } as unknown as jest.Mocked<MessagingSaveMessagesAndEnqueueContactCreationService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationMessageIngestionService,
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue({
              id: CONNECTED_ACCOUNT_ID,
              handle: CHANNEL_HANDLE,
              handleAliases: [],
            } as unknown as ConnectedAccountEntity),
          },
        },
        {
          provide: ApplicationMessageChannelsService,
          useValue: channelsService,
        },
        {
          provide: MessagingSaveMessagesAndEnqueueContactCreationService,
          useValue: saveMessagesService,
        },
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: (callback: () => unknown) => callback(),
            getRepository: () => ({
              find: jest
                .fn()
                .mockImplementation(async () =>
                  existingRecordIds.map((id) => ({ id })),
                ),
            }),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationMessageIngestionService);
  });

  const savedMessages = () =>
    saveMessagesService.saveMessagesAndEnqueueContactCreation.mock.calls[0][0];

  it('routes through the shared save path rather than writing records directly', async () => {
    await service.ingest({ ...scope, messages: [aMessage()] });

    expect(
      saveMessagesService.saveMessagesAndEnqueueContactCreation,
    ).toHaveBeenCalledTimes(1);
    expect(savedMessages()[0]).toEqual(
      expect.objectContaining({
        externalId: 'msg-1',
        messageThreadExternalId: 'thread-1',
        text: 'hello',
        isDraft: false,
      }),
    );
  });

  it('namespaces the dedup key by application so apps cannot collide', async () => {
    await service.ingest({ ...scope, messages: [aMessage()] });

    expect(savedMessages()[0].headerMessageId).toBe(
      `app:${APPLICATION_ID}:msg-1`,
    );
  });

  it('derives direction from the sender rather than trusting the app', async () => {
    await service.ingest({ ...scope, messages: [aMessage()] });
    expect(savedMessages()[0].direction).toBe(MessageDirection.INCOMING);

    saveMessagesService.saveMessagesAndEnqueueContactCreation.mockClear();

    await service.ingest({
      ...scope,
      messages: [
        aMessage({
          participants: [
            { role: MessageParticipantRole.FROM, handle: CHANNEL_HANDLE },
            { role: MessageParticipantRole.TO, handle: 'urn:li:person:ada' },
          ],
        }),
      ],
    });
    expect(savedMessages()[0].direction).toBe(MessageDirection.OUTGOING);
  });

  it('defaults a missing subject to null rather than an empty string', async () => {
    await service.ingest({ ...scope, messages: [aMessage()] });

    expect(savedMessages()[0].subject).toBeNull();
  });

  it('rejects a message with no sender', async () => {
    await expect(
      service.ingest({
        ...scope,
        messages: [
          aMessage({
            participants: [
              { role: MessageParticipantRole.TO, handle: CHANNEL_HANDLE },
            ],
          }),
        ],
      }),
    ).rejects.toMatchObject({
      code: MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
    });

    expect(
      saveMessagesService.saveMessagesAndEnqueueContactCreation,
    ).not.toHaveBeenCalled();
  });

  it('rejects a message with two senders', async () => {
    await expect(
      service.ingest({
        ...scope,
        messages: [
          aMessage({
            participants: [
              { role: MessageParticipantRole.FROM, handle: 'a' },
              { role: MessageParticipantRole.FROM, handle: 'b' },
            ],
          }),
        ],
      }),
    ).rejects.toMatchObject({
      code: MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
    });
  });

  it('rejects a batch repeating one external id', async () => {
    await expect(
      service.ingest({
        ...scope,
        messages: [aMessage(), aMessage()],
      }),
    ).rejects.toMatchObject({
      code: MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
    });

    expect(
      saveMessagesService.saveMessagesAndEnqueueContactCreation,
    ).not.toHaveBeenCalled();
  });

  it('refuses to ingest into a paused channel', async () => {
    channelsService.findOwnedOrThrow.mockResolvedValue({
      id: MESSAGE_CHANNEL_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      handle: CHANNEL_HANDLE,
      type: MessageChannelType.APP,
      isSyncEnabled: false,
    } as MessageChannelEntity);

    await expect(
      service.ingest({ ...scope, messages: [aMessage()] }),
    ).rejects.toMatchObject({
      code: MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
    });

    expect(
      saveMessagesService.saveMessagesAndEnqueueContactCreation,
    ).not.toHaveBeenCalled();
  });

  it('gates on channel ownership before touching anything else', async () => {
    channelsService.findOwnedOrThrow.mockRejectedValue(new Error('not yours'));

    await expect(
      service.ingest({ ...scope, messages: [aMessage()] }),
    ).rejects.toThrow('not yours');
  });

  it('returns the ids the app needs to link its own records', async () => {
    const result = await service.ingest({ ...scope, messages: [aMessage()] });

    expect(result.messages).toEqual([
      {
        externalId: 'msg-1',
        messageId: 'message-uuid',
        messageThreadId: 'thread-uuid',
      },
    ]);
  });
  describe('explicit identity', () => {
    const PERSON_ID = '66666666-6666-4666-8666-666666666666';

    it('passes a supplied personId through to the saved participant', async () => {
      existingRecordIds = [PERSON_ID];

      await service.ingest({
        ...scope,
        messages: [
          aMessage({
            participants: [
              {
                role: MessageParticipantRole.FROM,
                handle: 'urn:li:person:ada',
                personId: PERSON_ID,
              },
              { role: MessageParticipantRole.TO, handle: CHANNEL_HANDLE },
            ],
          }),
        ],
      });

      expect(savedMessages()[0].participants[0]).toEqual(
        expect.objectContaining({ personId: PERSON_ID }),
      );
    });

    it('defaults an omitted identity to null rather than undefined', async () => {
      await service.ingest({ ...scope, messages: [aMessage()] });

      expect(savedMessages()[0].participants[0]).toEqual(
        expect.objectContaining({ personId: null, workspaceMemberId: null }),
      );
    });

    it('rejects a personId that does not exist in the workspace', async () => {
      existingRecordIds = [];

      await expect(
        service.ingest({
          ...scope,
          messages: [
            aMessage({
              participants: [
                {
                  role: MessageParticipantRole.FROM,
                  handle: 'urn:li:person:ada',
                  personId: PERSON_ID,
                },
              ],
            }),
          ],
        }),
      ).rejects.toMatchObject({
        code: MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      });

      expect(
        saveMessagesService.saveMessagesAndEnqueueContactCreation,
      ).not.toHaveBeenCalled();
    });

    it('does not query for records when no identity is supplied', async () => {
      await service.ingest({ ...scope, messages: [aMessage()] });

      expect(
        saveMessagesService.saveMessagesAndEnqueueContactCreation,
      ).toHaveBeenCalled();
    });
  });

  it("refuses to ingest into another member's private channel", async () => {
    channelsService.findOwnedOrThrow.mockRejectedValue(
      new Error('ownership violation'),
    );

    await expect(
      service.ingest({
        ...scope,
        requestUserWorkspaceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        messages: [aMessage()],
      }),
    ).rejects.toThrow('ownership violation');

    expect(
      saveMessagesService.saveMessagesAndEnqueueContactCreation,
    ).not.toHaveBeenCalled();
  });

  it('passes the request user to the ownership gate', async () => {
    await service.ingest({
      ...scope,
      requestUserWorkspaceId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      messages: [aMessage()],
    });

    expect(channelsService.findOwnedOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        requestUserWorkspaceId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      }),
    );
  });
});
