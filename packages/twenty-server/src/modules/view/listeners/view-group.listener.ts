import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewGroupSyncService } from 'src/modules/view/services/view-group-sync.service';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';

import { BaseViewSyncListener } from './base-view-sync.listener';

@Injectable()
export class ViewGroupListener extends BaseViewSyncListener<ViewGroupWorkspaceEntity> {
  constructor(viewGroupSyncService: ViewGroupSyncService) {
    super(
      {
        create:
          viewGroupSyncService.createCoreViewGroup.bind(viewGroupSyncService),
        update:
          viewGroupSyncService.updateCoreViewGroup.bind(viewGroupSyncService),
        delete:
          viewGroupSyncService.deleteCoreViewGroup.bind(viewGroupSyncService),
        destroy:
          viewGroupSyncService.destroyCoreViewGroup.bind(viewGroupSyncService),
        restore:
          viewGroupSyncService.restoreCoreViewGroup.bind(viewGroupSyncService),
      },
      ViewGroupListener.name,
      'view group',
    );
  }

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.CREATED)
  async handleViewGroupCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewGroupWorkspaceEntity>
    >,
  ) {
    return this.handleCreated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.UPDATED)
  async handleViewGroupUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewGroupWorkspaceEntity>
    >,
  ) {
    return this.handleUpdated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.DELETED)
  async handleViewGroupDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewGroupWorkspaceEntity>
    >,
  ) {
    return this.handleDeleted(batchEvent);
  }

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.DESTROYED)
  async handleViewGroupDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<ViewGroupWorkspaceEntity>
    >,
  ) {
    return this.handleDestroyed(batchEvent);
  }

  @OnDatabaseBatchEvent('viewGroup', DatabaseEventAction.RESTORED)
  async handleViewGroupRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewGroupWorkspaceEntity>
    >,
  ) {
    return this.handleRestored(batchEvent);
  }
}
