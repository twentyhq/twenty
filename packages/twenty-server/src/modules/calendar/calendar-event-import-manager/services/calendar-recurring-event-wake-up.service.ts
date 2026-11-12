import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CalendarChannelSyncStage, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Any, Not, Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { CALENDAR_RECURRING_EVENT_HORIZON_MS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-recurring-event-horizon-ms.constant';
import { CALENDAR_RECURRING_EVENT_WAKE_UP_OWNER_TYPE } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-recurring-event-wake-up-owner-type.constant';
import { GoogleCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/services/google-calendar-get-events.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';

@Injectable()
export class CalendarRecurringEventWakeUpService
  implements PendingWakeUpOwnerHandler<null>, OnModuleInit
{
  constructor(
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly googleCalendarGetEventsService: GoogleCalendarGetEventsService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  onModuleInit(): void {
    this.pendingWakeUpOwnerHandlerRegistryService.register(
      CALENDAR_RECURRING_EVENT_WAKE_UP_OWNER_TYPE,
      this,
    );
  }

  async scheduleImmediateWakeUpForRecurringEvents({
    workspaceId,
    calendarChannelId,
    recurringEventExternalIds,
  }: {
    workspaceId: string;
    calendarChannelId: string;
    recurringEventExternalIds: string[];
  }): Promise<void> {
    for (const recurringEventExternalId of recurringEventExternalIds) {
      await this.scheduleWakeUpForRecurringEvent({
        workspaceId,
        calendarChannelId,
        recurringEventExternalId,
        wakeUpAt: new Date(),
      });
    }
  }

  async getOwnerState(): Promise<PendingWakeUpOwnerState<null>> {
    return { status: 'WAITING', owner: null };
  }

  async getReadPermissions() {
    return null;
  }

  async resolve({ wakeUp }: { wakeUp: PendingWakeUpEntity }): Promise<void> {
    const {
      workspaceId,
      ownerId: calendarChannelId,
      ownerKey: recurringEventExternalId,
    } = wakeUp;

    const syncableCalendarChannel =
      await this.calendarChannelRepository.findOne({
        where: {
          id: calendarChannelId,
          workspaceId,
          isSyncEnabled: true,
          syncStage: Not(CalendarChannelSyncStage.FAILED),
        },
        relations: ['connectedAccount'],
      });

    const isRecurringEventHorizonEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CALENDAR_RECURRING_EVENT_HORIZON_ENABLED,
        workspaceId,
      );

    if (
      !isDefined(syncableCalendarChannel) ||
      !isRecurringEventHorizonEnabled
    ) {
      await this.pendingWakeUpService.claim({
        workspaceId,
        wakeUpId: wakeUp.id,
      });

      return;
    }

    const recurringEventHorizon = new Date(
      Date.now() + CALENDAR_RECURRING_EVENT_HORIZON_MS,
    );

    const {
      instanceExternalIdsWithinHorizon,
      earliestInstanceStartTimeBeyondHorizon,
    } =
      await this.googleCalendarGetEventsService.getUpcomingRecurringEventInstances(
        {
          connectedAccount: syncableCalendarChannel.connectedAccount,
          recurringEventExternalId,
          recurringEventHorizon,
        },
      );

    await this.queueInstancesNotYetImported({
      workspaceId,
      calendarChannelId,
      instanceExternalIdsWithinHorizon,
    });

    if (!isDefined(earliestInstanceStartTimeBeyondHorizon)) {
      await this.pendingWakeUpService.claim({
        workspaceId,
        wakeUpId: wakeUp.id,
      });

      return;
    }

    const nextWakeUpAt = new Date(
      earliestInstanceStartTimeBeyondHorizon -
        CALENDAR_RECURRING_EVENT_HORIZON_MS,
    );

    await this.scheduleWakeUpForRecurringEvent({
      workspaceId,
      calendarChannelId,
      recurringEventExternalId,
      wakeUpAt: nextWakeUpAt,
    });
  }

  private async queueInstancesNotYetImported({
    workspaceId,
    calendarChannelId,
    instanceExternalIdsWithinHorizon,
  }: {
    workspaceId: string;
    calendarChannelId: string;
    instanceExternalIdsWithinHorizon: string[];
  }): Promise<void> {
    if (instanceExternalIdsWithinHorizon.length === 0) {
      return;
    }

    const importedInstanceAssociations = await this.workspaceOrmManager
      .getRepositoryWithoutPermissionChecks<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
      )
      .find({
        where: {
          calendarChannelId,
          eventExternalId: Any(instanceExternalIdsWithinHorizon),
        },
        select: { eventExternalId: true },
      });

    const importedInstanceExternalIds = new Set(
      importedInstanceAssociations.map(
        ({ eventExternalId }) => eventExternalId,
      ),
    );

    const instanceExternalIdsNotYetImported =
      instanceExternalIdsWithinHorizon.filter(
        (instanceExternalId) =>
          !importedInstanceExternalIds.has(instanceExternalId),
      );

    if (instanceExternalIdsNotYetImported.length === 0) {
      return;
    }

    const calendarEventIdsToImportCacheKey = `calendar-events-to-import:${workspaceId}:${calendarChannelId}`;

    await this.cacheStorage.setAdd(
      calendarEventIdsToImportCacheKey,
      instanceExternalIdsNotYetImported,
    );
  }

  private async scheduleWakeUpForRecurringEvent({
    workspaceId,
    calendarChannelId,
    recurringEventExternalId,
    wakeUpAt,
  }: {
    workspaceId: string;
    calendarChannelId: string;
    recurringEventExternalId: string;
    wakeUpAt: Date;
  }): Promise<void> {
    await this.pendingWakeUpService.arm({
      workspaceId,
      owner: {
        type: CALENDAR_RECURRING_EVENT_WAKE_UP_OWNER_TYPE,
        id: calendarChannelId,
        key: recurringEventExternalId,
      },
      condition: { type: 'TIME', resumeAt: wakeUpAt.toISOString() },
    });
  }
}
