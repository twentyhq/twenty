import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { Any } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { buildCalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-save-operations.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { buildCalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/utils/build-calendar-event-participant-save-operations.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

@Injectable()
export class CalendarSaveEventsService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  public async saveCalendarEventsAndEnqueueContactCreationJob(
    fetchedCalendarEvents: FetchedCalendarEvent[],
    calendarChannel: CalendarChannelEntity,
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<{ calendarEventIds: string[] }> {
    const authContext = buildSystemAuthContext(workspaceId);

    const shouldSkipUnchangedRecords =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CALENDAR_SYNC_SKIP_UNCHANGED_RECORDS_ENABLED,
        workspaceId,
      );

    const { savedParticipantIds, calendarEventIds } =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const calendarChannelEventAssociationRepository =
            this.workspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
              'calendarChannelEventAssociation',
              { shouldBypassPermissionChecks: true },
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

          const calendarEventRepository =
            this.workspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
              'calendarEvent',
              { shouldBypassPermissionChecks: true },
            );

          const existingCalendarEvents = shouldSkipUnchangedRecords
            ? await calendarEventRepository.find({
                where: {
                  id: Any(
                    existingAssociations.map(
                      (association) => association.calendarEventId,
                    ),
                  ),
                },
              })
            : [];

          const {
            saveOperations,
            existingCalendarEventIds,
            participantsOfNewEvents,
            participantsOfExistingEvents,
          } = buildCalendarEventSaveOperations({
            fetchedCalendarEvents,
            existingAssociations,
            existingCalendarEvents,
            calendarChannelId: calendarChannel.id,
            shouldSkipUnchangedCalendarEvents: shouldSkipUnchangedRecords,
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
              shouldSkipUnchangedParticipants: shouldSkipUnchangedRecords,
            });

          await this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const calendarEventRepository =
                transactionScope.getRepository<CalendarEventWorkspaceEntity>(
                  'calendarEvent',
                  { shouldBypassPermissionChecks: true },
                );

              const associationRepository =
                transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                  'calendarChannelEventAssociation',
                  { shouldBypassPermissionChecks: true },
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
              ...existingCalendarEventIds,
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
