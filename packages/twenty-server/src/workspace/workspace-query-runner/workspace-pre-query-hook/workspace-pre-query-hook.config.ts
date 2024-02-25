import { MessageFindManyPreQueryHook } from 'src/workspace/messaging/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePreQueryHook } from 'src/workspace/messaging/query-hooks/message/message-find-one.pre-query-hook';
import { WorkspaceQueryHook } from 'src/workspace/workspace-query-runner/workspace-pre-query-hook/types/workspace-query-hook.type';

// TODO: move to a decorator
export const workspacePreQueryHooks: WorkspaceQueryHook = {
  message: {
    findOne: [MessageFindOnePreQueryHook.name],
    findMany: [MessageFindManyPreQueryHook.name],
  },
};
