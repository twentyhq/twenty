import { Module } from '@nestjs/common';

import { TaskDeleteManyPostQueryHook } from 'src/modules/task/query-hooks/task-delete-many.post-query.hook';
import { TaskDeleteOnePostQueryHook } from 'src/modules/task/query-hooks/task-delete-one.post-query.hook';
import { TaskPostQueryHookService } from 'src/modules/task/query-hooks/task-post-query-hook.service';
import { TaskRestoreManyPostQueryHook } from 'src/modules/task/query-hooks/task-restore-many.post-query.hook';
import { TaskRestoreOnePostQueryHook } from 'src/modules/task/query-hooks/task-restore-one.post-query.hook';

@Module({
  providers: [
    TaskPostQueryHookService,
    TaskDeleteManyPostQueryHook,
    TaskDeleteOnePostQueryHook,
    TaskRestoreManyPostQueryHook,
    TaskRestoreOnePostQueryHook,
  ],
})
export class TaskQueryHookModule {}
