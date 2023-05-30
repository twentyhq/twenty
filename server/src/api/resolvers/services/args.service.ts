import { Injectable } from '@nestjs/common';
import { Workspace } from '@prisma/client';

type FindManyArgsType = { where?: object; orderBy?: object };

@Injectable()
export class ArgsService {
  async prepareFindManyArgs<T extends FindManyArgsType>(
    args: T,
    workspace: Workspace,
  ): Promise<T> {
    args.where = {
      ...args.where,
      ...{ workspace: { is: { id: { equals: workspace.id } } } },
    };
    return args;
  }
}
