import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

const MESSAGE_ID = '77777777-7777-4777-8777-777777777777';

describe('MatchParticipantService', () => {
  let service: MatchParticipantService<MessageParticipantWorkspaceEntity>;
  let participantTargetReconciliationService: {
    reconcileParticipantTargets: jest.Mock;
  };
  let participantRepository: { find: jest.Mock; updateMany: jest.Mock };

  beforeEach(async () => {
    participantTargetReconciliationService = {
      reconcileParticipantTargets: jest.fn(),
    };
    participantRepository = {
      find: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchParticipantService,
        {
          provide: WorkspaceOrmManager,
          useValue: { getRepository: () => participantRepository },
        },
        {
          provide: ParticipantTargetReconciliationService,
          useValue: participantTargetReconciliationService,
        },
      ],
    }).compile();

    service = module.get(MatchParticipantService);
  });

  const aParticipant = () =>
    ({
      id: '88888888-8888-4888-8888-888888888888',
      messageId: MESSAGE_ID,
      handle: 'urn:li:person:abc',
      personId: '66666666-6666-4666-8666-666666666666',
    }) as unknown as MessageParticipantWorkspaceEntity;

  // The whole point of the mode: a handle that is not an email address would
  // resolve to nobody, and the matcher writes personId back to null when it
  // finds nobody — discarding an identity the caller had already supplied.
  it('reconciles targets without looking any handle up as an email', async () => {
    await service.matchParticipants({
      participants: [aParticipant()],
      sourceRecordIds: [MESSAGE_ID],
      objectMetadataName: 'messageParticipant',
      matchWith: 'targetsOnly',
    });

    expect(
      participantTargetReconciliationService.reconcileParticipantTargets,
    ).toHaveBeenCalledWith({
      sourceRecordIds: [MESSAGE_ID],
      objectMetadataName: 'messageParticipant',
      transactionScope: undefined,
    });
    expect(participantRepository.find).not.toHaveBeenCalled();
    expect(participantRepository.updateMany).not.toHaveBeenCalled();
  });

  // The mode returns early; falling through would reconcile a second time at
  // the end of the match path, for no benefit and twice the queries.
  it('reconciles exactly once', async () => {
    await service.matchParticipants({
      participants: [aParticipant()],
      sourceRecordIds: [MESSAGE_ID],
      objectMetadataName: 'messageParticipant',
      matchWith: 'targetsOnly',
    });

    expect(
      participantTargetReconciliationService.reconcileParticipantTargets,
    ).toHaveBeenCalledTimes(1);
  });
});
