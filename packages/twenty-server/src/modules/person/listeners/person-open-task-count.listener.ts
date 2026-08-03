import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordRestoreEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { PersonOpenTaskCountService } from 'src/modules/person/services/person-open-task-count.service';
import { type TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

type TaskEvent =
  | ObjectRecordCreateEvent<TaskWorkspaceEntity>
  | ObjectRecordUpdateEvent<TaskWorkspaceEntity>
  | ObjectRecordDeleteEvent<TaskWorkspaceEntity>
  | ObjectRecordDestroyEvent<TaskWorkspaceEntity>
  | ObjectRecordRestoreEvent<TaskWorkspaceEntity>;

type TaskTargetEvent =
  | ObjectRecordCreateEvent<TaskTargetWorkspaceEntity>
  | ObjectRecordUpdateEvent<TaskTargetWorkspaceEntity>
  | ObjectRecordDeleteEvent<TaskTargetWorkspaceEntity>
  | ObjectRecordDestroyEvent<TaskTargetWorkspaceEntity>
  | ObjectRecordRestoreEvent<TaskTargetWorkspaceEntity>;

@Injectable()
export class PersonOpenTaskCountListener {
  constructor(
    private readonly personOpenTaskCountService: PersonOpenTaskCountService,
  ) {}

  @OnDatabaseBatchEvent('task', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('task', DatabaseEventAction.UPDATED)
  @OnDatabaseBatchEvent('task', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('task', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('task', DatabaseEventAction.RESTORED)
  async handleTaskEvent(payload: WorkspaceEventBatch<TaskEvent>) {
    const taskIds = payload.events.map((event) => event.recordId);

    const personIds =
      await this.personOpenTaskCountService.findPersonIdsTargetedByTasks({
        workspaceId: payload.workspaceId,
        taskIds,
      });

    await this.personOpenTaskCountService.recomputeForPersonIds({
      workspaceId: payload.workspaceId,
      personIds,
    });
  }

  @OnDatabaseBatchEvent('taskTarget', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('taskTarget', DatabaseEventAction.UPDATED)
  @OnDatabaseBatchEvent('taskTarget', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('taskTarget', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('taskTarget', DatabaseEventAction.RESTORED)
  async handleTaskTargetEvent(payload: WorkspaceEventBatch<TaskTargetEvent>) {
    // A retarget writes a new person and leaves the old one stale, so both
    // sides of an update have to be recounted.
    const personIds = payload.events.flatMap((event) => {
      const properties = event.properties as {
        before?: Partial<TaskTargetWorkspaceEntity>;
        after?: Partial<TaskTargetWorkspaceEntity>;
      };

      return [
        properties.before?.targetPersonId,
        properties.after?.targetPersonId,
      ].filter(isDefined);
    });

    await this.personOpenTaskCountService.recomputeForPersonIds({
      workspaceId: payload.workspaceId,
      personIds,
    });
  }
}
