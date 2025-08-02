import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import chunk from 'lodash.chunk';
import differenceWith from 'lodash.differencewith';
import { Any } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

type FetchedCalendarEventParticipantWithCalendarEventId =
  FetchedCalendarEventParticipant & {
    calendarEventId: string;
  };

type FetchedCalendarEventParticipantWithCalendarEventIdAndExistingId =
  FetchedCalendarEventParticipantWithCalendarEventId & {
    id: string;
  };

@Injectable()
export class CalendarEventParticipantService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly matchParticipantService: MatchParticipantService<CalendarEventParticipantWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  public async upsertAndDeleteCalendarEventParticipants({
    participantsToCreate,
    participantsToUpdate,
    transactionManager,
    calendarChannel,
    connectedAccount,
    workspaceId,
  }: {
    participantsToCreate: FetchedCalendarEventParticipantWithCalendarEventId[];
    participantsToUpdate: FetchedCalendarEventParticipantWithCalendarEventId[];
    transactionManager?: WorkspaceEntityManager;
    calendarChannel: CalendarChannelWorkspaceEntity;
    connectedAccount: ConnectedAccountWorkspaceEntity;
    workspaceId: string;
  }): Promise<void> {
    const chunkedParticipantsToUpdate = chunk(participantsToUpdate, 200);

    const calendarEventParticipantRepository =
      await this.twentyORMManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    for (const participantsToUpdateChunk of chunkedParticipantsToUpdate) {
      const existingCalendarEventParticipants =
        await calendarEventParticipantRepository.find({
          where: {
            calendarEventId: Any(
              participantsToUpdateChunk
                .map((participant) => participant.calendarEventId)
                .filter(isDefined),
            ),
          },
        });

      const {
        calendarEventParticipantsToUpdate,
        newCalendarEventParticipants,
      } = participantsToUpdateChunk.reduce<{
        calendarEventParticipantsToUpdate: FetchedCalendarEventParticipantWithCalendarEventIdAndExistingId[];
        newCalendarEventParticipants: FetchedCalendarEventParticipantWithCalendarEventId[];
      }>(
        (acc, calendarEventParticipant) => {
          const existingCalendarEventParticipant =
            existingCalendarEventParticipants.find(
              (existingCalendarEventParticipant) =>
                existingCalendarEventParticipant.handle ===
                  calendarEventParticipant.handle &&
                existingCalendarEventParticipant.calendarEventId ===
                  calendarEventParticipant.calendarEventId,
            );

          if (existingCalendarEventParticipant) {
            acc.calendarEventParticipantsToUpdate.push({
              ...calendarEventParticipant,
              id: existingCalendarEventParticipant.id,
            });
          } else {
            acc.newCalendarEventParticipants.push(calendarEventParticipant);
          }

          return acc;
        },
        {
          calendarEventParticipantsToUpdate: [],
          newCalendarEventParticipants: [],
        },
      );

      const calendarEventParticipantsToDelete = differenceWith(
        existingCalendarEventParticipants,
        participantsToUpdateChunk,
        (existingCalendarEventParticipant, participantToUpdate) =>
          existingCalendarEventParticipant.handle ===
            participantToUpdate.handle &&
          existingCalendarEventParticipant.calendarEventId ===
            participantToUpdate.calendarEventId,
      );

      await calendarEventParticipantRepository.delete(
        {
          id: Any(
            calendarEventParticipantsToDelete.map(
              (calendarEventParticipant) => calendarEventParticipant.id,
            ),
          ),
        },
        transactionManager,
      );

      await calendarEventParticipantRepository.updateMany(
        calendarEventParticipantsToUpdate.map((participant) => ({
          criteria: participant.id,
          partialEntity: participant,
        })),
        transactionManager,
      );
      participantsToCreate.push(...newCalendarEventParticipants);
    }

    const chunkedParticipantsToCreate = chunk(participantsToCreate, 200);
    const savedParticipants: CalendarEventParticipantWorkspaceEntity[] = [];

    for (const participantsToCreateChunk of chunkedParticipantsToCreate) {
      const savedParticipantsChunk =
        await calendarEventParticipantRepository.insert(
          participantsToCreateChunk,
          transactionManager,
        );

      savedParticipants.push(...savedParticipantsChunk.raw);
    }

    if (calendarChannel.isContactAutoCreationEnabled) {
      await this.messageQueueService.add<CreateCompanyAndContactJobData>(
        CreateCompanyAndContactJob.name,
        {
          workspaceId,
          connectedAccount,
          contactsToCreate: savedParticipants,
          source: FieldActorSource.CALENDAR,
        },
      );
    }

    await this.matchParticipantService.matchParticipants({
      participants: savedParticipants,
      objectMetadataName: 'calendarEventParticipant',
      transactionManager,
      matchWith: 'workspaceMemberAndPerson',
    });
  }
}
