import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { buildCalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-save-operations.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { buildCalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/utils/build-calendar-event-participant-save-operations.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
  ) {}

  public async saveCalendarEventsAndEnqueueContactCreationJob(
    fetchedCalendarEvents: FetchedCalendarEvent[],
    calendarChannel: CalendarChannelEntity,
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    const savedParticipantIds =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const calendarChannelEventAssociationRepository =
            await this.globalWorkspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
              workspaceId,
              'calendarChannelEventAssociation',
            );

          const existingAssociations =
            await calendarChannelEventAssociationRepository.find({
              where: {
                eventExternalId: Any(
                  fetchedCalendarEvents.map((event) => event.id),
                ),
                calendarChannelId: calendarChannel.id,
              },
            });

          const calendarEventOperations = buildCalendarEventSaveOperations({
            fetchedCalendarEvents,
            existingAssociations,
            calendarChannelId: calendarChannel.id,
          });

          const existingParticipants =
            await this.calendarEventParticipantService.findCalendarEventParticipantsByCalendarEventIds(
              {
                calendarEventIds:
                  calendarEventOperations.participantsToUpdate.map(
                    (participant) => participant.calendarEventId,
                  ),
                workspaceId,
              },
            );

          const participantOperations =
            buildCalendarEventParticipantSaveOperations({
              participantsToCreate:
                calendarEventOperations.participantsToCreate,
              participantsToUpdate:
                calendarEventOperations.participantsToUpdate,
              existingParticipants,
            });

          await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const calendarEventRepository =
                transactionScope.getRepository<CalendarEventWorkspaceEntity>(
                  'calendarEvent',
                );

              const associationRepository =
                transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                  'calendarChannelEventAssociation',
                );

              if (calendarEventOperations.calendarEventsToInsert.length > 0) {
                await calendarEventRepository.insert(
                  calendarEventOperations.calendarEventsToInsert,
                );
              }

              if (calendarEventOperations.calendarEventsToUpdate.length > 0) {
                await calendarEventRepository.updateMany(
                  calendarEventOperations.calendarEventsToUpdate,
                );
              }

              if (calendarEventOperations.associationsToInsert.length > 0) {
                await associationRepository.insert(
                  calendarEventOperations.associationsToInsert,
                );
              }

              if (calendarEventOperations.associationsToUpdate.length > 0) {
                await associationRepository.updateMany(
                  calendarEventOperations.associationsToUpdate,
                );
              }

              await this.calendarEventParticipantService.writeCalendarEventParticipants(
                {
                  operations: participantOperations,
                  transactionScope,
                },
              );
            },
          );

          return participantOperations.participantsToInsert.map(
            (participant) => participant.id,
          );
        },
        authContext,
        { lite: true },
      );

    await this.calendarEventParticipantService.matchParticipantsAndEnqueueContactCreationJob(
      {
        savedParticipantIds,
        calendarChannel,
        connectedAccount,
        workspaceId,
      },
    );
  }
}
