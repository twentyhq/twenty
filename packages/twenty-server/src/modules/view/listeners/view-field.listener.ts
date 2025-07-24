import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewFieldSyncService } from 'src/modules/view/services/view-field-sync.service';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

import { BaseViewSyncListener } from './base-view-sync.listener';

@Injectable()
export class ViewFieldListener extends BaseViewSyncListener<ViewFieldWorkspaceEntity> {
  constructor(viewFieldSyncService: ViewFieldSyncService) {
    super(
      {
        create:
          viewFieldSyncService.createCoreViewField.bind(viewFieldSyncService),
        update:
          viewFieldSyncService.updateCoreViewField.bind(viewFieldSyncService),
        delete:
          viewFieldSyncService.deleteCoreViewField.bind(viewFieldSyncService),
        destroy:
          viewFieldSyncService.destroyCoreViewField.bind(viewFieldSyncService),
        restore:
          viewFieldSyncService.restoreCoreViewField.bind(viewFieldSyncService),
      },
      ViewFieldListener.name,
      'view field',
    );
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.CREATED)
  async handleViewFieldCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewFieldWorkspaceEntity>
    >,
  ) {
    return this.handleCreated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.UPDATED)
  async handleViewFieldUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewFieldWorkspaceEntity>
    >,
  ) {
    return this.handleUpdated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.DELETED)
  async handleViewFieldDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewFieldWorkspaceEntity>
    >,
  ) {
    return this.handleDeleted(batchEvent);
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.DESTROYED)
  async handleViewFieldDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<ViewFieldWorkspaceEntity>
    >,
  ) {
    return this.handleDestroyed(batchEvent);
  }

  @OnDatabaseBatchEvent('viewField', DatabaseEventAction.RESTORED)
  async handleViewFieldRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewFieldWorkspaceEntity>
    >,
  ) {
    return this.handleRestored(batchEvent);
  }
}
