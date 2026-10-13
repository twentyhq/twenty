import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Any, Not, Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventSharingProvider } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-sharing-provider.type';
import { buildCalendarEventIdSharedByEventExternalId } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-id-shared-by-event-external-id.util';
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
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
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

    const sharingContext = await this.findCalendarEventSharingContext({
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

          const existingEventExternalIds = new Set(
            existingAssociations.map(
              (association) => association.eventExternalId,
            ),
          );

          const calendarEventIdSharedByEventExternalId = isDefined(
            sharingContext,
          )
            ? await this.findCalendarEventIdSharedByEventExternalId({
                ...sharingContext,
                fetchedCalendarEvents: fetchedCalendarEvents.filter(
                  (fetchedCalendarEvent) =>
                    !existingEventExternalIds.has(fetchedCalendarEvent.id),
                ),
                calendarChannelEventAssociationRepository,
                calendarEventRepository,
              })
            : new Map<string, string>();

          const storedCalendarEventIds = [
            ...existingAssociations.map(
              (association) => association.calendarEventId,
            ),
            ...calendarEventIdSharedByEventExternalId.values(),
          ];

          const existingCalendarEvents = shouldSkipUnchangedRecords
            ? await calendarEventRepository.find({
                where: { id: Any(storedCalendarEventIds) },
              })
            : [];

          const calendarEventIdsSharedWithOtherChannels = isDefined(
            sharingContext,
          )
            ? new Set(
                (
                  await calendarChannelEventAssociationRepository.find({
                    where: {
                      calendarEventId: Any(storedCalendarEventIds),
                      calendarChannelId: Any(
                        sharingContext.otherCalendarChannelIds,
                      ),
                    },
                  })
                ).map((association) => association.calendarEventId),
              )
            : new Set<string>();

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
            calendarEventIdSharedByEventExternalId,
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
              calendarEventIdsSharedWithOtherChannels,
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

  private async findCalendarEventSharingContext({
    calendarChannel,
    connectedAccount,
    workspaceId,
  }: {
    calendarChannel: Pick<CalendarChannelEntity, 'id'>;
    connectedAccount: Pick<ConnectedAccountEntity, 'provider'>;
    workspaceId: string;
  }): Promise<
    | {
        provider: CalendarEventSharingProvider;
        otherCalendarChannelIds: string[];
      }
    | undefined
  > {
    const { provider } = connectedAccount;

    if (
      provider !== ConnectedAccountProvider.GOOGLE &&
      provider !== ConnectedAccountProvider.MICROSOFT
    ) {
      return undefined;
    }

    const isSharingEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
      workspaceId,
    );

    if (!isSharingEnabled) {
      return undefined;
    }

    const otherCalendarChannels = await this.calendarChannelRepository.find({
      select: { id: true },
      where: {
        workspaceId,
        id: Not(calendarChannel.id),
        connectedAccount: { provider },
      },
    });

    if (otherCalendarChannels.length === 0) {
      return undefined;
    }

    return {
      provider,
      otherCalendarChannelIds: otherCalendarChannels.map(({ id }) => id),
    };
  }

  private async findCalendarEventIdSharedByEventExternalId({
    provider,
    fetchedCalendarEvents,
    otherCalendarChannelIds,
    calendarChannelEventAssociationRepository,
    calendarEventRepository,
  }: {
    provider: CalendarEventSharingProvider;
    fetchedCalendarEvents: FetchedCalendarEvent[];
    otherCalendarChannelIds: string[];
    calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>;
    calendarEventRepository: WorkspaceRepository<CalendarEventWorkspaceEntity>;
  }): Promise<Map<string, string>> {
    if (fetchedCalendarEvents.length === 0) {
      return new Map();
    }

    if (provider === ConnectedAccountProvider.GOOGLE) {
      const otherChannelAssociations =
        await calendarChannelEventAssociationRepository.find({
          where: {
            eventExternalId: Any(fetchedCalendarEvents.map(({ id }) => id)),
            calendarChannelId: Any(otherCalendarChannelIds),
          },
        });

      return buildCalendarEventIdSharedByEventExternalId({
        provider,
        fetchedCalendarEvents,
        otherChannelAssociations,
        otherChannelCalendarEvents: [],
      });
    }

    const iCalUids = fetchedCalendarEvents
      .map(({ iCalUid }) => iCalUid)
      .filter(isNonEmptyString);

    if (iCalUids.length === 0) {
      return new Map();
    }

    const otherChannelCalendarEvents = await calendarEventRepository.find({
      where: { iCalUid: Any(iCalUids) },
    });

    const otherChannelAssociations =
      otherChannelCalendarEvents.length > 0
        ? await calendarChannelEventAssociationRepository.find({
            where: {
              calendarEventId: Any(
                otherChannelCalendarEvents.map(({ id }) => id),
              ),
              calendarChannelId: Any(otherCalendarChannelIds),
            },
          })
        : [];

    return buildCalendarEventIdSharedByEventExternalId({
      provider,
      fetchedCalendarEvents,
      otherChannelAssociations,
      otherChannelCalendarEvents,
    });
  }
}
