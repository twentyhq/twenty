import { Workspace } from '@prisma/client';

type FindManyArgsType = { where?: object; orderBy?: object };

export const prepareFindManyArgs = <T extends FindManyArgsType>(
  args: T,
  workspace: Workspace,
): T => {
  args.where = {
    ...args.where,
    ...{ workspace: { is: { id: { equals: workspace.id } } } },
  };

  return args;
};
