import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { buildCalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-save-operations.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { buildCalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/utils/build-calendar-event-participant-save-operations.util';
import { CalendarChannelRecordShareService } from 'src/modules/calendar/common/services/calendar-channel-record-share.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { buildCalendarEventRecordSharesToInsert } from 'src/modules/calendar/common/utils/build-calendar-event-record-shares-to-insert.util';

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
    private readonly calendarChannelRecordShareService: CalendarChannelRecordShareService,
    private readonly recordShareService: RecordShareService,
  ) {}

  public async saveCalendarEventsAndEnqueueContactCreationJob(
    fetchedCalendarEvents: FetchedCalendarEvent[],
    calendarChannel: CalendarChannelEntity,
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<{ calendarEventIds: string[] }> {
    const authContext = buildSystemAuthContext(workspaceId);
    const calendarChannelRecordShareSource =
      await this.calendarChannelRecordShareService.buildSource({
        calendarChannel,
        connectedAccount,
        workspaceId,
      });

    const { savedParticipantIds, calendarEventIds } =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const calendarChannelEventAssociationRepository =
            this.workspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
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

          const {
            saveOperations,
            participantsOfNewEvents,
            participantsOfExistingEvents,
          } = buildCalendarEventSaveOperations({
            fetchedCalendarEvents,
            existingAssociations,
            calendarChannelId: calendarChannel.id,
          });

          const existingParticipants =
            await this.calendarEventParticipantService.findCalendarEventParticipantsByCalendarEventIds(
              {
                calendarEventIds: participantsOfExistingEvents.map(
                  (participant) => participant.calendarEventId,
                ),
              },
            );

          const participantOperations =
            buildCalendarEventParticipantSaveOperations({
              fetchedParticipants: [
                ...participantsOfNewEvents,
                ...participantsOfExistingEvents,
              ],
              existingParticipants,
            });

          await this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const calendarEventRepository =
                transactionScope.getRepository<CalendarEventWorkspaceEntity>(
                  'calendarEvent',
                );

              const associationRepository =
                transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                  'calendarChannelEventAssociation',
                );

              if (saveOperations.calendarEventsToInsert.length > 0) {
                await calendarEventRepository.insert(
                  saveOperations.calendarEventsToInsert,
                );
              }

              if (saveOperations.calendarEventsToUpdate.length > 0) {
                await calendarEventRepository.updateMany(
                  saveOperations.calendarEventsToUpdate,
                );
              }

              if (saveOperations.associationsToInsert.length > 0) {
                await associationRepository.insert(
                  saveOperations.associationsToInsert,
                );

                await this.recordShareService.insertMany({
                  workspaceId,
                  recordShares: buildCalendarEventRecordSharesToInsert({
                    calendarChannel: calendarChannelRecordShareSource,
                    calendarEventIds: saveOperations.associationsToInsert.map(
                      ({ calendarEventId }) => calendarEventId,
                    ),
                    calendarEventObjectMetadataId:
                      calendarEventRepository.internalContext
                        .objectIdByNameSingular.calendarEvent,
                  }),
                  transactionScope,
                });
              }

              if (saveOperations.associationsToUpdate.length > 0) {
                await associationRepository.updateMany(
                  saveOperations.associationsToUpdate,
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

          return {
            savedParticipantIds: participantOperations.participantsToInsert.map(
              (participant) => participant.id,
            ),
            calendarEventIds: [
              ...saveOperations.associationsToInsert.map(
                ({ calendarEventId }) => calendarEventId,
              ),
              ...saveOperations.calendarEventsToUpdate.map(
                ({ criteria }) => criteria,
              ),
            ],
          };
        },
        authContext,
        { lite: true },
      );

    await this.calendarEventParticipantService.matchParticipantsAndEnqueueContactCreationJob(
      {
        savedParticipantIds,
        calendarEventIds,
        calendarChannel,
        connectedAccount,
        workspaceId,
      },
    );

    return { calendarEventIds };
  }
}
