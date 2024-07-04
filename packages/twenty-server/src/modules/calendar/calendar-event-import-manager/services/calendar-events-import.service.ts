import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Any } from 'typeorm';
import { isDefined } from 'class-validator';

import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import {
  CalendarEventParticipantWithCalendarEventId,
  CalendarEventWithParticipantsAndCalendarEventId,
} from 'src/modules/calendar/common/types/calendar-event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { GoogleCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/services/google-calendar-get-events.service';
import { filterEventsAndReturnCancelledEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events.util';
import { injectIdsInCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/inject-ids-in-calendar-events.util';

@Injectable()
export class CalendarEventsImportService {
  private readonly logger = new Logger(CalendarEventsImportService.name);

  constructor(
    @InjectWorkspaceRepository(CalendarEventWorkspaceEntity)
    private readonly calendarEventRepository: WorkspaceRepository<CalendarEventWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelEventAssociationWorkspaceEntity)
    private readonly calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarEventParticipantWorkspaceEntity)
    private readonly calendarEventParticipantsRepository: WorkspaceRepository<CalendarEventParticipantWorkspaceEntity>,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
    private readonly calendarEventParticipantsService: CalendarEventParticipantService,
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly googleCalendarGetEventsService: GoogleCalendarGetEventsService,
  ) {}

  public async processCalendarEventsImport(
    calendarChannel: CalendarChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsCalendarEventsImportOngoing(
      connectedAccount.id,
    );

    const calendarChannelId = calendarChannel.id;

    const { calendarEvents, nextSyncCursor } =
      await this.googleCalendarGetEventsService.getCalendarEvents(
        connectedAccount,
        calendarChannel.syncCursor,
      );

    if (!calendarEvents || calendarEvents?.length === 0) {
      return;
    }

    const blocklist = await this.blocklistRepository.getByWorkspaceMemberId(
      connectedAccount.accountOwnerId,
      workspaceId,
    );

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannel,
        calendarEvents,
        blocklist.map((blocklist) => blocklist.handle),
      );

    const cancelledEventExternalIds = cancelledEvents.map(
      (event) => event.externalId,
    );

    const existingCalendarEvents = await this.calendarEventRepository.find({
      where: {
        iCalUID: Any(filteredEvents.map((event) => event.iCalUID as string)),
      },
    });

    const iCalUIDCalendarEventIdMap = new Map(
      existingCalendarEvents.map((calendarEvent) => [
        calendarEvent.iCalUID,
        calendarEvent.id,
      ]),
    );

    const calendarEventsWithIds = injectIdsInCalendarEvents(
      filteredEvents,
      iCalUIDCalendarEventIdMap,
    );

    // TODO: When we will be able to add unicity contraint on iCalUID, we will do a INSERT ON CONFLICT DO UPDATE

    const existingEventsICalUIDs = existingCalendarEvents.map(
      (calendarEvent) => calendarEvent.iCalUID,
    );

    const eventsToSave = calendarEventsWithIds.filter(
      (calendarEvent) =>
        !existingEventsICalUIDs.includes(calendarEvent.iCalUID),
    );

    const eventsToUpdate = calendarEventsWithIds.filter((calendarEvent) =>
      existingEventsICalUIDs.includes(calendarEvent.iCalUID),
    );

    const existingCalendarChannelEventAssociations =
      await this.calendarChannelEventAssociationRepository.find({
        where: {
          eventExternalId: Any(
            calendarEventsWithIds.map((calendarEvent) => calendarEvent.id),
          ),
          calendarChannel: {
            id: calendarChannelId,
          },
        },
      });

    const calendarChannelEventAssociationsToSave = calendarEventsWithIds
      .filter(
        (calendarEvent) =>
          !existingCalendarChannelEventAssociations.some(
            (association) => association.eventExternalId === calendarEvent.id,
          ),
      )
      .map((calendarEvent) => ({
        calendarEventId: calendarEvent.id,
        eventExternalId: calendarEvent.externalId,
        calendarChannelId,
      }));

    await this.saveGoogleCalendarEvents(
      eventsToSave,
      eventsToUpdate,
      calendarChannelEventAssociationsToSave,
      connectedAccount,
      calendarChannel,
      workspaceId,
    );

    await this.calendarChannelEventAssociationRepository.delete({
      eventExternalId: Any(cancelledEventExternalIds),
      calendarChannel: {
        id: calendarChannelId,
      },
    });

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      workspaceId,
    );

    await this.calendarChannelRepository.update(
      {
        id: calendarChannel.id,
      },
      {
        syncCursor: nextSyncCursor,
      },
    );

    await this.calendarChannelSyncStatusService.markAsCalendarEventsImportCompleted(
      connectedAccount.id,
    );
  }

  public async saveGoogleCalendarEvents(
    eventsToSave: CalendarEventWithParticipantsAndCalendarEventId[],
    eventsToUpdate: CalendarEventWithParticipantsAndCalendarEventId[],
    calendarChannelEventAssociationsToSave: {
      calendarEventId: string;
      eventExternalId: string;
      calendarChannelId: string;
    }[],
    connectedAccount: ConnectedAccountWorkspaceEntity,
    calendarChannel: CalendarChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const participantsToSave = eventsToSave.flatMap(
      (event) => event.participants,
    );

    const participantsToUpdate = eventsToUpdate.flatMap(
      (event) => event.participants,
    );

    const savedCalendarEventParticipantsToEmit: CalendarEventParticipantWorkspaceEntity[] =
      [];

    await this.workspaceDataSource?.transaction(async (transactionManager) => {
      await this.calendarEventRepository.save(
        eventsToSave,
        {},
        transactionManager,
      );

      await this.calendarChannelRepository.save(
        eventsToUpdate,
        {},
        transactionManager,
      );

      await this.calendarChannelEventAssociationRepository.save(
        calendarChannelEventAssociationsToSave,
        {},
        transactionManager,
      );

      await this.saveCalendarEventParticipants(
        participantsToSave,
        participantsToUpdate,
        workspaceId,
        transactionManager,
      );
    });

    this.eventEmitter.emit(`calendarEventParticipant.matched`, {
      workspaceId,
      workspaceMemberId: connectedAccount.accountOwnerId,
      calendarEventParticipants: savedCalendarEventParticipantsToEmit,
    });

    if (calendarChannel.isContactAutoCreationEnabled) {
      await this.messageQueueService.add<CreateCompanyAndContactJobData>(
        CreateCompanyAndContactJob.name,
        {
          workspaceId,
          connectedAccount,
          contactsToCreate: participantsToSave,
        },
      );
    }
  }

  public async saveCalendarEventParticipants(
    participantsToSave: CalendarEventParticipantWithCalendarEventId[],
    participantsToUpdate: CalendarEventParticipantWithCalendarEventId[],
    workspaceId: string,
    transactionManager?: any,
  ): Promise<CalendarEventParticipantWorkspaceEntity[]> {
    const existingCalendarEventParticipants =
      await this.calendarEventParticipantsRepository.find({
        where: {
          calendarEventId: Any(
            participantsToUpdate
              .map((participant) => participant.calendarEventId)
              .filter(isDefined),
          ),
        },
      });

    const { calendarEventParticipantsToDelete, newCalendarEventParticipants } =
      participantsToUpdate.reduce(
        (acc, calendarEventParticipant) => {
          const existingCalendarEventParticipant =
            existingCalendarEventParticipants.find(
              (existingCalendarEventParticipant) =>
                existingCalendarEventParticipant.handle ===
                calendarEventParticipant.handle,
            );

          if (existingCalendarEventParticipant) {
            acc.calendarEventParticipantsToDelete.push(
              existingCalendarEventParticipant,
            );
          } else {
            acc.newCalendarEventParticipants.push(calendarEventParticipant);
          }

          return acc;
        },
        {
          calendarEventParticipantsToDelete:
            [] as CalendarEventParticipantWorkspaceEntity[],
          newCalendarEventParticipants:
            [] as CalendarEventParticipantWithCalendarEventId[],
        },
      );

    await this.calendarEventParticipantsRepository.delete({
      id: Any(
        calendarEventParticipantsToDelete.map(
          (calendarEventParticipant) => calendarEventParticipant.id,
        ),
      ),
    });

    await this.calendarEventParticipantsRepository.save(participantsToUpdate);

    participantsToSave.push(...newCalendarEventParticipants);

    return await this.calendarEventParticipantsService.saveCalendarEventParticipants(
      participantsToSave,
      workspaceId,
      transactionManager,
    );
  }
}
