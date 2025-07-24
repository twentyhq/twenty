import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewFieldSyncService } from 'src/modules/view/services/view-field-sync.service';
import { ViewSyncService } from 'src/modules/view/services/view-sync.service';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

@Injectable()
export class ViewFieldListener {
  private readonly logger = new Logger(ViewFieldListener.name);

  constructor(
    private readonly viewFieldSyncService: ViewFieldSyncService,
    private readonly viewSyncService: ViewSyncService,
  ) {}

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.CREATED)
  async handleViewFieldCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewFieldWorkspaceEntity>
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
        await this.viewFieldSyncService.createCoreViewField(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view field ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.UPDATED)
  async handleViewFieldUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewFieldWorkspaceEntity>
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
        await this.viewFieldSyncService.updateCoreViewField(
          batchEvent.workspaceId,
          event.properties.after,
          event.properties.diff,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view field ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.DELETED)
  async handleViewFieldDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewFieldWorkspaceEntity>
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
        await this.viewFieldSyncService.deleteCoreViewField(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view field ${event.properties.before.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.DESTROYED)
  async handleViewFieldDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<ViewFieldWorkspaceEntity>
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
        await this.viewFieldSyncService.destroyCoreViewField(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view field ${event.properties.before.id} to core:`,
          error,
        );
      }
    }
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.RESTORED)
  async handleViewFieldRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewFieldWorkspaceEntity>
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
        await this.viewFieldSyncService.restoreCoreViewField(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync view field ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }
}
