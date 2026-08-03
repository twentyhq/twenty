import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { computeOpenTaskCountByPersonId } from 'src/modules/person/utils/compute-open-task-count-by-person-id.util';
import { type TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';

// openTaskCount is derived and written by the system, never by the actor whose
// task edit triggered the recount, so their own role must not gate it.
const SYSTEM_MAINTAINED_FIELD_PERMISSIONS: RolePermissionConfig = {
  shouldBypassPermissionChecks: true,
};

@Injectable()
export class PersonOpenTaskCountService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async findPersonIdsTargetedByTasks({
    workspaceId,
    taskIds,
  }: {
    workspaceId: string;
    taskIds: string[];
  }): Promise<string[]> {
    if (taskIds.length === 0) {
      return [];
    }

    const taskTargetRepository =
      await this.globalWorkspaceOrmManager.getRepository<TaskTargetWorkspaceEntity>(
        workspaceId,
        'taskTarget',
        SYSTEM_MAINTAINED_FIELD_PERMISSIONS,
      );

    // Soft-deleted targets are included on purpose: the person they point at
    // still needs a recount when their task target is removed.
    const taskTargets = await taskTargetRepository.find({
      where: { taskId: In(taskIds) },
      select: { targetPersonId: true },
      withDeleted: true,
    });

    return [
      ...new Set(
        taskTargets
          .map((taskTarget) => taskTarget.targetPersonId)
          .filter(isDefined),
      ),
    ];
  }

  async recomputeForPersonIds({
    workspaceId,
    personIds,
  }: {
    workspaceId: string;
    personIds: string[];
  }): Promise<void> {
    const uniquePersonIds = [...new Set(personIds)];

    if (uniquePersonIds.length === 0) {
      return;
    }

    const taskTargetRepository =
      await this.globalWorkspaceOrmManager.getRepository<TaskTargetWorkspaceEntity>(
        workspaceId,
        'taskTarget',
        SYSTEM_MAINTAINED_FIELD_PERMISSIONS,
      );

    const openTaskCountByPersonId = await computeOpenTaskCountByPersonId({
      taskTargetRepository,
      personIds: uniquePersonIds,
    });

    const personRepository =
      await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        SYSTEM_MAINTAINED_FIELD_PERMISSIONS,
      );

    // People whose last open task just went away are absent from the map above
    // and still have to be written back down to zero.
    const personIdsByOpenTaskCount = new Map<number, string[]>();

    for (const personId of uniquePersonIds) {
      const openTaskCount = openTaskCountByPersonId.get(personId) ?? 0;

      personIdsByOpenTaskCount.set(openTaskCount, [
        ...(personIdsByOpenTaskCount.get(openTaskCount) ?? []),
        personId,
      ]);
    }

    for (const [openTaskCount, groupedPersonIds] of personIdsByOpenTaskCount) {
      await personRepository.update(
        { id: In(groupedPersonIds) },
        { openTaskCount },
      );
    }
  }
}
