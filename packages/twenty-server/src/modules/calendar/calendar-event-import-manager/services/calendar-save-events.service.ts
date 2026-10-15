import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { Any } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarEventSharingService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-sharing.service';
import { buildCalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-save-operations.util';
import { getCalendarChannelHandles } from 'src/modules/calendar/calendar-event-import-manager/utils/get-calendar-channel-handles.util';
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
    private readonly calendarEventSharingService: CalendarEventSharingService,
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

    const isCalendarEventSharingEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
        workspaceId,
      );

    const otherCalendarChannels =
      await this.calendarEventSharingService.findOtherCalendarChannels({
        workspaceId,
        calendarChannelId: calendarChannel.id,
        provider: connectedAccount.provider,
      });

    const channelHandles = getCalendarChannelHandles(
      calendarChannel,
      connectedAccount,
    );

    const {
      savedParticipantIds,
      participantsOfLinkedEvents,
      calendarEventIds,
    } = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
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

            const existingAssociations = await associationRepository.find({
              where: {
                eventExternalId: Any(
                  fetchedCalendarEvents.map((event) => event.id),
                ),
                calendarChannelId: calendarChannel.id,
              },
            });

            const existingEventExternalIds = new Set(
              existingAssociations.map(
                (association) => association.eventExternalId,
              ),
            );

            const calendarEventIdToLinkByEventExternalId =
              isCalendarEventSharingEnabled
                ? await this.calendarEventSharingService.findCalendarEventIdsToLink(
                    {
                      transactionScope,
                      provider: connectedAccount.provider,
                      otherCalendarChannels,
                      fetchedCalendarEvents: fetchedCalendarEvents.filter(
                        (fetchedCalendarEvent) =>
                          !existingEventExternalIds.has(
                            fetchedCalendarEvent.id,
                          ),
                      ),
                    },
                  )
                : new Map<string, string>();

            const storedCalendarEventIds = [
              ...existingAssociations.map(
                (association) => association.calendarEventId,
              ),
              ...calendarEventIdToLinkByEventExternalId.values(),
            ];

            const otherChannelIdsByCalendarEventId =
              await this.calendarEventSharingService.findOtherChannelIdsByCalendarEventId(
                {
                  transactionScope,
                  calendarChannelId: calendarChannel.id,
                  calendarEventIds: storedCalendarEventIds,
                },
              );

            const existingCalendarEvents = shouldSkipUnchangedRecords
              ? await calendarEventRepository.find({
                  where: { id: Any(storedCalendarEventIds) },
                })
              : [];

            const {
              saveOperations,
              existingCalendarEventIds,
              channelRoleByCalendarEventId,
              participantsOfNewEvents,
              participantsOfExistingEvents,
              participantsOfLinkedEvents,
            } = buildCalendarEventSaveOperations({
              fetchedCalendarEvents,
              existingAssociations,
              existingCalendarEvents,
              calendarChannelId: calendarChannel.id,
              channelHandles,
              calendarEventIdToLinkByEventExternalId,
              otherChannelIdsByCalendarEventId,
              otherCalendarChannels,
            });

            const existingParticipants =
              await this.calendarEventParticipantService.findCalendarEventParticipantsByCalendarEventIds(
                { calendarEventIds: storedCalendarEventIds, transactionScope },
              );

            const participantOperations =
              buildCalendarEventParticipantSaveOperations({
                fetchedParticipants: [
                  ...participantsOfNewEvents,
                  ...participantsOfExistingEvents,
                  ...participantsOfLinkedEvents,
                ],
                existingParticipants,
                shouldSkipUnchangedParticipants: shouldSkipUnchangedRecords,
                channelRoleByCalendarEventId,
                channelHandles,
              });

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

            return {
              savedParticipantIds:
                participantOperations.participantsToInsert.map(
                  (participant) => participant.id,
                ),
              participantsOfLinkedEvents,
              calendarEventIds: [
                ...saveOperations.associationsToInsert.map(
                  ({ calendarEventId }) => calendarEventId,
                ),
                ...existingCalendarEventIds,
              ],
            };
          },
        ),
      authContext,
      { lite: true },
    );

    await this.calendarEventParticipantService.matchParticipantsAndEnqueueContactCreationJob(
      {
        savedParticipantIds,
        participantsOfLinkedEvents,
        calendarEventIds,
        calendarChannel,
        connectedAccount,
        workspaceId,
      },
    );

    return { calendarEventIds };
  }
}
