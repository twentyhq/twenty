import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { Any, In, Not } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type CalendarEventSharingChannel } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-sharing-channel.type';
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

        const existingAssociations =
          await calendarChannelEventAssociationRepository.find({
            where: {
              eventExternalId: Any(
                fetchedCalendarEvents.map((event) => event.id),
              ),
              calendarChannelId: calendarChannel.id,
            },
          });

        const existingEventExternalIds = new Set(
          existingAssociations
            .map(({ eventExternalId }) => eventExternalId)
            .filter(isNonEmptyString),
        );

        // Not gated by the flag: events shared before it was turned off keep their roles
        const otherAssociationsOfExistingEvents =
          existingAssociations.length > 0
            ? await calendarChannelEventAssociationRepository.find({
                where: {
                  calendarEventId: Any(
                    existingAssociations.map(
                      ({ calendarEventId }) => calendarEventId,
                    ),
                  ),
                  calendarChannelId: Not(calendarChannel.id),
                },
              })
            : [];

        const linkCandidateAssociations = isCalendarEventSharingEnabled
          ? await this.findLinkCandidateAssociations({
              calendarChannelEventAssociationRepository,
              provider: connectedAccount.provider,
              calendarChannelId: calendarChannel.id,
              fetchedCalendarEvents: fetchedCalendarEvents.filter(
                ({ id }) => !existingEventExternalIds.has(id),
              ),
            })
          : [];

        const otherAssociations = [
          ...otherAssociationsOfExistingEvents,
          ...linkCandidateAssociations,
        ];

        const otherCalendarChannels: CalendarEventSharingChannel[] =
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
          candidateCalendarEventIds.length > 0
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
          existingEventExternalIds,
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
          existingCalendarEvents: candidateCalendarEvents,
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

  private async findLinkCandidateAssociations({
    calendarChannelEventAssociationRepository,
    provider,
    calendarChannelId,
    fetchedCalendarEvents,
  }: {
    calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>;
    provider: ConnectedAccountProvider;
    calendarChannelId: string;
    fetchedCalendarEvents: FetchedCalendarEvent[];
  }): Promise<CalendarChannelEventAssociationWorkspaceEntity[]> {
    if (fetchedCalendarEvents.length === 0) {
      return [];
    }

    switch (provider) {
      case ConnectedAccountProvider.GOOGLE:
        return calendarChannelEventAssociationRepository.find({
          where: {
            eventExternalId: Any(fetchedCalendarEvents.map(({ id }) => id)),
            calendarChannelId: Not(calendarChannelId),
          },
        });
      case ConnectedAccountProvider.MICROSOFT: {
        const iCalUids = fetchedCalendarEvents
          .map(({ iCalUid }) => iCalUid)
          .filter(isNonEmptyString);

        return iCalUids.length > 0
          ? calendarChannelEventAssociationRepository.find({
              where: {
                calendarEvent: { iCalUid: Any(iCalUids) },
                calendarChannelId: Not(calendarChannelId),
              },
            })
          : [];
      }
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case ConnectedAccountProvider.EMAIL_GROUP:
      case ConnectedAccountProvider.APP:
        return [];
      default:
        return assertUnreachable(provider);
    }
  }
}
