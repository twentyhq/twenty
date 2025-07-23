import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';
import { ViewFilterGroupSyncService } from 'src/modules/view/services/view-filter-group-sync.service';
import { ViewSyncService } from 'src/modules/view/services/view-sync.service';

@Injectable()
export class ViewFilterGroupListener {
  private readonly logger = new Logger(ViewFilterGroupListener.name);

  constructor(
    private readonly viewFilterGroupSyncService: ViewFilterGroupSyncService,
    private readonly viewSyncService: ViewSyncService,
  ) {}

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.CREATED)
  async handleViewFilterGroupCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewFilterGroupWorkspaceEntity>
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
        await this.viewFilterGroupSyncService.createCoreViewFilterGroup(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter group ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.UPDATED)
  async handleViewFilterGroupUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewFilterGroupWorkspaceEntity>
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
        await this.viewFilterGroupSyncService.updateCoreViewFilterGroup(
          batchEvent.workspaceId,
          event.properties.after,
          event.properties.diff,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter group ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.DELETED)
  async handleViewFilterGroupDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewFilterGroupWorkspaceEntity>
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
        await this.viewFilterGroupSyncService.deleteCoreViewFilterGroup(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter group ${event.properties.before.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.RESTORED)
  async handleViewFilterGroupRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewFilterGroupWorkspaceEntity>
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
        await this.viewFilterGroupSyncService.restoreCoreViewFilterGroup(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view filter group ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }
}
