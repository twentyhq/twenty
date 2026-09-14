import { Test, type TestingModule } from '@nestjs/testing';

import { MessageParticipantRole } from 'twenty-shared/types';

import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';
import { type ParticipantWithMessageId } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const MESSAGE_ID = '77777777-7777-4777-8777-777777777777';
const PARTICIPANT_ID = '88888888-8888-4888-8888-888888888888';
const PERSON_ID = '66666666-6666-4666-8666-666666666666';

describe('MessagingMessageParticipantService', () => {
  let service: MessagingMessageParticipantService;
  let participantRepository: {
    find: jest.Mock;
    insert: jest.Mock;
    updateMany: jest.Mock;
  };
  let transactionScope: WorkspaceTransactionScope;

  const anEmailParticipant = (): ParticipantWithMessageId => ({
    messageId: MESSAGE_ID,
    handle: 'ada@example.com',
    displayName: 'Ada',
    role: MessageParticipantRole.FROM,
  });

  beforeEach(async () => {
    participantRepository = {
      find: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockResolvedValue({ identifiers: [] }),
      updateMany: jest.fn().mockResolvedValue(undefined),
    };

    transactionScope = {
      getRepository: () => participantRepository,
    } as unknown as WorkspaceTransactionScope;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingMessageParticipantService,
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: (callback: () => unknown) => callback(),
          },
        },
        {
          provide: MatchParticipantService,
          useValue: { matchParticipants: jest.fn() },
        },
        {
          provide: ParticipantTargetReconciliationService,
          useValue: { reconcileParticipantTargets: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(MessagingMessageParticipantService);
  });

  const givenAnExistingParticipant = (personId: string | null) => {
    participantRepository.find.mockResolvedValueOnce([
      {
        id: PARTICIPANT_ID,
        messageId: MESSAGE_ID,
        handle: 'ada@example.com',
        displayName: 'Ada',
        role: MessageParticipantRole.FROM,
        personId,
        workspaceMemberId: null,
      },
    ]);
  };

  it('inserts a new participant with a null identity when none is supplied', async () => {
    await service.saveMessageParticipants(
      [anEmailParticipant()],
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        handle: 'ada@example.com',
        personId: null,
        workspaceMemberId: null,
      }),
    ]);
    expect(participantRepository.updateMany).not.toHaveBeenCalled();
  });

  it('links an existing participant when the caller now knows the person', async () => {
    givenAnExistingParticipant(null);

    await service.saveMessageParticipants(
      [{ ...anEmailParticipant(), personId: PERSON_ID }],
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.updateMany).toHaveBeenCalledWith([
      {
        criteria: PARTICIPANT_ID,
        partialEntity: { personId: PERSON_ID, workspaceMemberId: null },
      },
    ]);
  });

  it('leaves an existing participant alone when the caller supplies no identity', async () => {
    givenAnExistingParticipant(PERSON_ID);

    await service.saveMessageParticipants(
      [anEmailParticipant()],
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.updateMany).not.toHaveBeenCalled();
    expect(participantRepository.insert).toHaveBeenCalledWith([]);
  });

  it('does not rewrite an identity that already matches', async () => {
    givenAnExistingParticipant(PERSON_ID);

    await service.saveMessageParticipants(
      [{ ...anEmailParticipant(), personId: PERSON_ID }],
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.updateMany).not.toHaveBeenCalled();
  });
});
