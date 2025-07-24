import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewFilterSyncService } from 'src/modules/view/services/view-filter-sync.service';
import { ViewSyncService } from 'src/modules/view/services/view-sync.service';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';

@Injectable()
export class ViewFilterListener {
  private readonly logger = new Logger(ViewFilterListener.name);

  constructor(
    private readonly viewFilterSyncService: ViewFilterSyncService,
    private readonly viewSyncService: ViewSyncService,
  ) {}

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.CREATED)
  async handleViewFilterCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    const isEnabled = await this.viewSyncService.isFeatureFlagEnabled(
      batchEvent.workspaceId,
    );

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.viewFilterSyncService.createCoreViewFilter(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.UPDATED)
  async handleViewFilterUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    const isEnabled = await this.viewSyncService.isFeatureFlagEnabled(
      batchEvent.workspaceId,
    );

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.viewFilterSyncService.updateCoreViewFilter(
          batchEvent.workspaceId,
          event.properties.after,
          event.properties.diff,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.DELETED)
  async handleViewFilterDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    const isEnabled = await this.viewSyncService.isFeatureFlagEnabled(
      batchEvent.workspaceId,
    );

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.viewFilterSyncService.deleteCoreViewFilter(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter ${event.properties.before.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.DESTROYED)
  async handleViewFilterDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    const isEnabled = await this.viewSyncService.isFeatureFlagEnabled(
      batchEvent.workspaceId,
    );

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.viewFilterSyncService.destroyCoreViewFilter(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter ${event.properties.before.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.RESTORED)
  async handleViewFilterRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    const isEnabled = await this.viewSyncService.isFeatureFlagEnabled(
      batchEvent.workspaceId,
    );

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.viewFilterSyncService.restoreCoreViewFilter(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }
}
