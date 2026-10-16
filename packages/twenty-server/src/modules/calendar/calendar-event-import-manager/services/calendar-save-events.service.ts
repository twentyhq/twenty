import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';
import { Any, In } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildCalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-save-operations.util';
import { getCalendarChannelHandles } from 'src/modules/calendar/calendar-event-import-manager/utils/get-calendar-channel-handles.util';
import { resolveCalendarEventSharing } from 'src/modules/calendar/calendar-event-import-manager/utils/resolve-calendar-event-sharing.util';
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
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: WorkspaceScopedRepository<CalendarChannelEntity>,
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

    const channelHandles = getCalendarChannelHandles({
      calendarChannel,
      connectedAccount,
    });

    const {
      savedParticipantIds,
      participantsOfLinkedEvents,
      calendarEventIds,
    } = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarChannelEventAssociationRepository =
          this.workspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
            'calendarChannelEventAssociation',
            { shouldBypassPermissionChecks: true },
          );

        const calendarEventRepository =
          this.workspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
            'calendarEvent',
            { shouldBypassPermissionChecks: true },
          );

        const fetchedEventExternalIds = fetchedCalendarEvents.map(
          (event) => event.id,
        );

        const fetchedICalUids = fetchedCalendarEvents
          .map(({ iCalUid }) => iCalUid)
          .filter(isNonEmptyString);

        // Google copies of a meeting share the event id, Outlook copies only the iCalUid
        const associations =
          await calendarChannelEventAssociationRepository.find({
            where: [
              {
                eventExternalId: Any(fetchedEventExternalIds),
              },
              ...(connectedAccount.provider ===
                ConnectedAccountProvider.MICROSOFT && fetchedICalUids.length > 0
                ? [{ calendarEvent: { iCalUid: Any(fetchedICalUids) } }]
                : []),
            ],
          });

        const fetchedEventExternalIdSet = new Set(fetchedEventExternalIds);

        const existingAssociations = associations.filter(
          (association) =>
            association.calendarChannelId === calendarChannel.id &&
            isNonEmptyString(association.eventExternalId) &&
            fetchedEventExternalIdSet.has(association.eventExternalId),
        );

        const otherAssociations = associations.filter(
          (association) => association.calendarChannelId !== calendarChannel.id,
        );

        const otherCalendarChannels =
          otherAssociations.length > 0
            ? await this.calendarChannelRepository.find(workspaceId, {
                where: {
                  id: In([
                    ...new Set(
                      otherAssociations.map(
                        ({ calendarChannelId }) => calendarChannelId,
                      ),
                    ),
                  ]),
                  connectedAccount: { provider: connectedAccount.provider },
                },
                relations: { connectedAccount: true },
                select: {
                  id: true,
                  handle: true,
                  syncStatus: true,
                  isSyncEnabled: true,
                  connectedAccount: { id: true, handleAliases: true },
                },
              })
            : [];

        const otherCalendarChannelIds = new Set(
          otherCalendarChannels.map(({ id }) => id),
        );

        const sharedAssociations = otherAssociations.filter(
          ({ calendarChannelId }) =>
            otherCalendarChannelIds.has(calendarChannelId),
        );

        const candidateCalendarEventIds = [
          ...new Set(
            [...existingAssociations, ...sharedAssociations].map(
              ({ calendarEventId }) => calendarEventId,
            ),
          ),
        ];

        const candidateCalendarEvents =
          candidateCalendarEventIds.length > 0 &&
          (shouldSkipUnchangedRecords || sharedAssociations.length > 0)
            ? await calendarEventRepository.find({
                where: { id: Any(candidateCalendarEventIds) },
              })
            : [];

        const {
          calendarEventIdToLinkByEventExternalId,
          otherChannelIdsByCalendarEventId,
        } = resolveCalendarEventSharing({
          provider: connectedAccount.provider,
          fetchedCalendarEvents,
          existingEventExternalIds: new Set(
            existingAssociations
              .map(({ eventExternalId }) => eventExternalId)
              .filter(isNonEmptyString),
          ),
          sharedAssociations,
          iCalUidByCalendarEventId: new Map(
            candidateCalendarEvents.map(({ id, iCalUid }) => [id, iCalUid]),
          ),
          isCalendarEventSharingEnabled,
        });

        const storedCalendarEventIds = [
          ...existingAssociations.map(
            (association) => association.calendarEventId,
          ),
          ...calendarEventIdToLinkByEventExternalId.values(),
        ];

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
          existingCalendarEvents: shouldSkipUnchangedRecords
            ? candidateCalendarEvents
            : [],
          calendarChannelId: calendarChannel.id,
          channelHandles,
          calendarEventIdToLinkByEventExternalId,
          otherChannelIdsByCalendarEventId,
          otherCalendarChannels,
        });

        const existingParticipants =
          await this.calendarEventParticipantService.findCalendarEventParticipantsByCalendarEventIds(
            { calendarEventIds: storedCalendarEventIds },
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
          participantsOfLinkedEvents,
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
