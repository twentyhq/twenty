import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { OPEN_TASK_STATUSES } from 'src/modules/person/constants/open-task-statuses.constant';
import { type TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';

// People with no open tasks are absent from the result rather than mapped to 0,
// so callers must default missing ids themselves.
export const computeOpenTaskCountByPersonId = async ({
  taskTargetRepository,
  personIds,
}: {
  taskTargetRepository: WorkspaceRepository<TaskTargetWorkspaceEntity>;
  personIds: string[];
}): Promise<Map<string, number>> => {
  if (personIds.length === 0) {
    return new Map();
  }

  // A task can be tied to the same person through several targets, so the count
  // is over distinct tasks rather than over target rows.
  const rows = await taskTargetRepository
    .createQueryBuilder('taskTarget')
    .select('taskTarget.targetPersonId', 'personId')
    .addSelect('COUNT(DISTINCT taskTarget.taskId)', 'openTaskCount')
    .innerJoin('taskTarget.task', 'task')
    .where('taskTarget.targetPersonId IN (:...personIds)', { personIds })
    .andWhere('taskTarget.deletedAt IS NULL')
    .andWhere('task.deletedAt IS NULL')
    .andWhere('task.status::text IN (:...openTaskStatuses)', {
      openTaskStatuses: OPEN_TASK_STATUSES,
    })
    .groupBy('taskTarget.targetPersonId')
    .getRawMany<{ personId: string; openTaskCount: string }>();

  return new Map(rows.map((row) => [row.personId, Number(row.openTaskCount)]));
};
