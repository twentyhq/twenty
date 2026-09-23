import { Test, type TestingModule } from '@nestjs/testing';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
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
  let matchParticipantService: { matchParticipants: jest.Mock };

  const anEmailParticipant = (): ParticipantWithMessageId => ({
    messageId: MESSAGE_ID,
    handle: 'ada@example.com',
    displayName: 'Ada',
    role: MessageParticipantRole.FROM,
  });

  beforeEach(async () => {
    matchParticipantService = { matchParticipants: jest.fn() };
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
          useValue: matchParticipantService,
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
        partialEntity: {
          personId: PERSON_ID,
          workspaceMemberId: null,
          displayName: 'Ada',
        },
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
  // The enrichment promise: ingest first, resolve the contact later. A
  // provider that renames someone between deliveries, or omits the name,
  // must not split the participant in two.
  it('links the existing participant when the display name changed too', async () => {
    givenAnExistingParticipant(null);

    await service.saveMessageParticipants(
      [{ ...anEmailParticipant(), displayName: 'Ada L.', personId: PERSON_ID }],
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.insert).toHaveBeenCalledWith([]);
    expect(participantRepository.updateMany).toHaveBeenCalledWith([
      {
        criteria: PARTICIPANT_ID,
        partialEntity: {
          personId: PERSON_ID,
          workspaceMemberId: null,
          displayName: 'Ada L.',
        },
      },
    ]);
  });

  // An omitted name reaches the service as an empty string, and this is the
  // only branch that writes the column, so the stored one has to survive: an
  // app adding a person link should not have to resend the name to keep it.
  it('keeps the stored display name when the caller omits it', async () => {
    givenAnExistingParticipant(null);

    await service.saveMessageParticipants(
      [{ ...anEmailParticipant(), displayName: '', personId: PERSON_ID }],
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.insert).toHaveBeenCalledWith([]);
    expect(participantRepository.updateMany).toHaveBeenCalledWith([
      {
        criteria: PARTICIPANT_ID,
        partialEntity: {
          personId: PERSON_ID,
          workspaceMemberId: null,
          displayName: 'Ada',
        },
      },
    ]);
  });

  // A batch is capped by messages, not participants, so one conversation with
  // many people in it can produce more updates than updateMany accepts.
  it('chunks identity updates past the single-call limit', async () => {
    const participantCount = QUERY_MAX_RECORDS + 50;
    const existingParticipants = Array.from(
      { length: participantCount },
      (_unused, index) => ({
        id: `participant-${index}`,
        messageId: MESSAGE_ID,
        handle: `member-${index}`,
        displayName: 'Ada',
        role: MessageParticipantRole.FROM,
        personId: null,
        workspaceMemberId: null,
      }),
    );

    participantRepository.find.mockResolvedValueOnce(existingParticipants);

    await service.saveMessageParticipants(
      existingParticipants.map(({ handle }) => ({
        ...anEmailParticipant(),
        handle,
        personId: PERSON_ID,
      })),
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.updateMany).toHaveBeenCalledTimes(2);

    const updatedCount = participantRepository.updateMany.mock.calls.reduce(
      (total, [updates]) => total + updates.length,
      0,
    );

    expect(updatedCount).toBe(participantCount);
    participantRepository.updateMany.mock.calls.forEach(([updates]) => {
      expect(updates.length).toBeLessThanOrEqual(QUERY_MAX_RECORDS);
    });
  });

  it('corrects a wrong person link without leaving the old one behind', async () => {
    const OTHER_PERSON_ID = '55555555-5555-4555-8555-555555555555';

    givenAnExistingParticipant(OTHER_PERSON_ID);

    await service.saveMessageParticipants(
      [{ ...anEmailParticipant(), displayName: 'Ada L.', personId: PERSON_ID }],
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.insert).toHaveBeenCalledWith([]);
    expect(participantRepository.updateMany).toHaveBeenCalledWith([
      expect.objectContaining({
        partialEntity: expect.objectContaining({ personId: PERSON_ID }),
      }),
    ]);
  });

  // Email relies on the exact match: the matcher, not the caller, sets the
  // identity, so a renamed sender is a different participant row as before.
  it('still inserts a new row when a caller with no identity renames a sender', async () => {
    givenAnExistingParticipant(null);

    await service.saveMessageParticipants(
      [{ ...anEmailParticipant(), displayName: 'Ada L.' }],
      WORKSPACE_ID,
      transactionScope,
    );

    expect(participantRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({ displayName: 'Ada L.', personId: null }),
    ]);
    expect(participantRepository.updateMany).not.toHaveBeenCalled();
  });

  it('matches with people and workspace members by default', async () => {
    await service.matchMessageParticipants({
      participants: [],
      messageIds: [MESSAGE_ID],
      workspaceId: WORKSPACE_ID,
    });

    expect(matchParticipantService.matchParticipants).toHaveBeenCalledWith(
      expect.objectContaining({ matchWith: 'workspaceMemberAndPerson' }),
    );
  });

  // An app channel's handles are not email addresses, so running the matcher
  // would null out the identities the caller supplied at save time.
  it('forwards targetsOnly so a non-email channel never runs the email matcher', async () => {
    await service.matchMessageParticipants({
      participants: [],
      messageIds: [MESSAGE_ID],
      workspaceId: WORKSPACE_ID,
      matchWith: 'targetsOnly',
    });

    expect(matchParticipantService.matchParticipants).toHaveBeenCalledWith(
      expect.objectContaining({
        matchWith: 'targetsOnly',
        sourceRecordIds: [MESSAGE_ID],
        objectMetadataName: 'messageParticipant',
      }),
    );
  });
});
