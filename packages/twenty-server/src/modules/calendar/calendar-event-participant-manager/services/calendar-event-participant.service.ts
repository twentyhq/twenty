import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { FieldActorSource } from 'twenty-shared/types';
import { Any, In } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE } from 'src/modules/calendar/calendar-event-participant-manager/constants/calendar-event-participant-chunk-size';
import { type CalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/types/calendar-event-participant-save-operations.type';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import {
  CreateCompanyAndContactJob,
  type CreateCompanyAndContactJobData,
} from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

@Injectable()
export class CalendarEventParticipantService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly matchParticipantService: MatchParticipantService<CalendarEventParticipantWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  public async findCalendarEventParticipantsByCalendarEventIds({
    calendarEventIds,
  }: {
    calendarEventIds: string[];
  }): Promise<CalendarEventParticipantWorkspaceEntity[]> {
    const calendarEventParticipantRepository =
      this.workspaceOrmManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    return calendarEventParticipantRepository.find({
      where: { calendarEventId: Any([...new Set(calendarEventIds)]) },
    });
  }

  public async writeCalendarEventParticipants({
    operations,
    transactionScope,
  }: {
    operations: CalendarEventParticipantSaveOperations;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const calendarEventParticipantRepository =
      transactionScope.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    if (operations.participantIdsToDelete.length > 0) {
      await calendarEventParticipantRepository.delete({
        id: Any(operations.participantIdsToDelete),
      });
    }

    for (const participantsChunk of chunk(
      operations.participantsToUpdate,
      CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE,
    )) {
      await calendarEventParticipantRepository.updateMany(participantsChunk);
    }

    for (const participantsChunk of chunk(
      operations.participantsToInsert,
      CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE,
    )) {
      await calendarEventParticipantRepository.insert(participantsChunk);
    }
  }

  public async matchParticipantsAndEnqueueContactCreationJob({
    savedParticipantIds,
    calendarChannel,
    connectedAccount,
    workspaceId,
    calendarEventIds,
  }: {
    savedParticipantIds: string[];
    calendarChannel: CalendarChannelEntity;
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    calendarEventIds: string[];
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarEventParticipantRepository =
          this.workspaceOrmManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
            'calendarEventParticipant',
          );

        const savedParticipants: CalendarEventParticipantWorkspaceEntity[] = [];

        for (const savedParticipantIdsChunk of chunk(
          savedParticipantIds,
          CALENDAR_EVENT_PARTICIPANT_CHUNK_SIZE,
        )) {
          const participantsChunk =
            await calendarEventParticipantRepository.find({
              where: { id: In(savedParticipantIdsChunk) },
            });

          savedParticipants.push(...participantsChunk);
        }

        if (calendarChannel.isContactAutoCreationEnabled) {
          await this.messageQueueService.add<CreateCompanyAndContactJobData>(
            CreateCompanyAndContactJob.name,
            {
              workspaceId,
              connectedAccount,
              contactsToCreate: savedParticipants.map((participant) => ({
                handle: participant.handle ?? '',
                displayName:
                  participant.displayName ?? participant.handle ?? '',
              })),
              source: FieldActorSource.CALENDAR,
            },
          );
        }

        await this.matchParticipantService.matchParticipants({
          participants: savedParticipants,
          sourceRecordIds: calendarEventIds,
          objectMetadataName: 'calendarEventParticipant',
          matchWith: 'workspaceMemberAndPerson',
        });
      },
      authContext,
      { lite: true },
    );
  }
}
