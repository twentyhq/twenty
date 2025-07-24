import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewSyncService } from 'src/modules/view/services/view-sync.service';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Injectable()
export class ViewListener {
  private readonly logger = new Logger(ViewListener.name);

  constructor(private readonly viewSyncService: ViewSyncService) {}

  @OnDatabaseBatchEvent('view', DatabaseEventAction.CREATED)
  async handleViewCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewWorkspaceEntity>
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
        await this.viewSyncService.createCoreView(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('view', DatabaseEventAction.UPDATED)
  async handleViewUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewWorkspaceEntity>
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
        await this.viewSyncService.updateCoreView(
          batchEvent.workspaceId,
          event.properties.after,
          event.properties.diff,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('view', DatabaseEventAction.DELETED)
  async handleViewDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewWorkspaceEntity>
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
        await this.viewSyncService.deleteCoreView(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view ${event.properties.before.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('view', DatabaseEventAction.RESTORED)
  async handleViewRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewWorkspaceEntity>
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
        await this.viewSyncService.restoreCoreView(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }
}
