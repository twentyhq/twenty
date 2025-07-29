import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewSyncService } from 'src/modules/view/services/view-sync.service';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

import { BaseViewSyncListener } from './base-view-sync.listener';

@Injectable()
export class ViewListener extends BaseViewSyncListener<ViewWorkspaceEntity> {
  constructor(viewSyncService: ViewSyncService) {
    super(
      {
        create: viewSyncService.createCoreView.bind(viewSyncService),
        update: viewSyncService.updateCoreView.bind(viewSyncService),
        delete: viewSyncService.deleteCoreView.bind(viewSyncService),
        destroy: viewSyncService.destroyCoreView.bind(viewSyncService),
        restore: viewSyncService.restoreCoreView.bind(viewSyncService),
      },
      ViewListener.name,
      'view',
    );
  }

  @OnDatabaseBatchEvent('view', DatabaseEventAction.CREATED)
  async handleViewCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewWorkspaceEntity>
    >,
  ) {
    return this.handleCreated(batchEvent);
  }

  @OnDatabaseBatchEvent('view', DatabaseEventAction.UPDATED)
  async handleViewUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewWorkspaceEntity>
    >,
  ) {
    return this.handleUpdated(batchEvent);
  }

  @OnDatabaseBatchEvent('view', DatabaseEventAction.DELETED)
  async handleViewDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewWorkspaceEntity>
    >,
  ) {
    return this.handleDeleted(batchEvent);
  }

  @OnDatabaseBatchEvent('view', DatabaseEventAction.DESTROYED)
  async handleViewDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<ViewWorkspaceEntity>
    >,
  ) {
    return this.handleDestroyed(batchEvent);
  }

  @OnDatabaseBatchEvent('view', DatabaseEventAction.RESTORED)
  async handleViewRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewWorkspaceEntity>
    >,
  ) {
    return this.handleRestored(batchEvent);
  }
}
