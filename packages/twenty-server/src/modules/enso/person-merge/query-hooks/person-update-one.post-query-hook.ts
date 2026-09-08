import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { FindPersonDuplicatesJob } from 'src/modules/enso/person-merge/jobs/find-person-duplicates.job';
import { type FindPersonDuplicatesJobData } from 'src/modules/enso/person-merge/jobs/person-merge-job.types';
import { extractRowRefs } from 'src/modules/enso/person-relationship/query-hooks/extract-row-refs.util';

// Stage-2 identity resolution. The key social case: a name-only social contact
// gets a phone/email added later (manager enters it, or it's captured in
// conversation) — re-check for duplicates that now share it and merge. Re-merge
// after a merge is a safe no-op (the duplicate is already gone).
@Injectable()
@WorkspaceQueryHook({
  key: `person.updateOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class PersonUpdateOnePostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    @InjectMessageQueue(MessageQueue.ensoPersonMergeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    for (const ref of extractRowRefs(payload)) {
      await this.messageQueueService.add<FindPersonDuplicatesJobData>(
        FindPersonDuplicatesJob.name,
        { workspaceId, personId: ref.id },
      );
    }
  }
}
