import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import { IEdge } from 'src/utils/pagination/interfaces/edge.interface';
import { PGGraphQLMutation } from 'src/workspace/workspace-query-runner/interfaces/pg-graphql.interface';

import {
  ExecuteHookMethod,
  WorkspacePreQueryHookPayload,
} from 'src/workspace/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import {
  workspacePostQueryHooks,
  workspacePreQueryHooks,
} from 'src/workspace/workspace-query-runner/workspace-query-hook/workspace-query-hook.config';

@Injectable()
export class WorkspaceQueryHookService {
  constructor(private readonly workspaceQueryHookModuleRef: ModuleRef) {}

  public async executePreHooks<T extends ExecuteHookMethod>(
    userId: string | undefined,
    workspaceId: string,
    objectName: string,
    method: T,
    payload: WorkspacePreQueryHookPayload<T>,
  ): Promise<void> {
    const hooks = workspacePreQueryHooks[objectName] || [];

    for (const hookName of Object.values(hooks[method] ?? [])) {
      const hook = await this.workspaceQueryHookModuleRef.get(hookName, {
        strict: false,
      });

      await hook.execute(userId, workspaceId, payload);
    }
  }

  public async executePostHooks<
    Record,
    Result extends
      | IConnection<Record, IEdge<Record>>
      | PGGraphQLMutation<Record>,
  >(
    userId: string | undefined,
    workspaceId: string,
    objectName: string,
    method: ExecuteHookMethod,
    resultFromPgGraphql: Result,
  ): Promise<Result> {
    const hooks = workspacePostQueryHooks[objectName] || [];

    let result = resultFromPgGraphql;

    for (const hookName of Object.values(hooks[method] ?? [])) {
      const hook = await this.workspaceQueryHookModuleRef.get(hookName, {
        strict: false,
      });

      result = await hook.execute(userId, workspaceId, result);
    }

    return result;
  }
}
