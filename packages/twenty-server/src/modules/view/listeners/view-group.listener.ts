import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewGroupSyncService } from 'src/modules/view/services/view-group-sync.service';
import { ViewSyncService } from 'src/modules/view/services/view-sync.service';

@Injectable()
export class ViewGroupListener {
  private readonly logger = new Logger(ViewGroupListener.name);

  constructor(
    private readonly viewGroupSyncService: ViewGroupSyncService,
    private readonly viewSyncService: ViewSyncService,
  ) {}

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.CREATED)
  async handleViewGroupCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewGroupWorkspaceEntity>
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
        await this.viewGroupSyncService.createCoreViewGroup(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view group ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.UPDATED)
  async handleViewGroupUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewGroupWorkspaceEntity>
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
        await this.viewGroupSyncService.updateCoreViewGroup(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view group ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.DELETED)
  async handleViewGroupDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewGroupWorkspaceEntity>
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
        await this.viewGroupSyncService.deleteCoreViewGroup(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view group ${event.properties.before.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.RESTORED)
  async handleViewGroupRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewGroupWorkspaceEntity>
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
        await this.viewGroupSyncService.restoreCoreViewGroup(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view group ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }
}
