import { msg } from '@lingui/core/macro';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@WorkspaceQueryHook('desk.updateOne')
export class DeskUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    // Only validate when owningCompanyId is being changed
    if (!('owningCompanyId' in payload.data)) {
      return payload;
    }

    const schemaName = getWorkspaceSchemaName(authContext.workspace.id);

    const result: Array<{ count: string }> = await this.dataSource.query(
      `SELECT COUNT(*) AS count FROM ${schemaName}."opportunity" WHERE "associatedDeskId" = $1 AND "deletedAt" IS NULL`,
      [payload.id],
    );

    const opportunityCount = parseInt(result[0].count, 10);

    if (opportunityCount > 0) {
      throw new CommonQueryRunnerException(
        `Desk ${payload.id} has ${opportunityCount} associated opportunities and cannot be reassigned to a new Owning Company`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Cannot reassign a Desk that has associated Opportunities. Remove all Opportunities from this Desk before changing its Owning Company.`,
        },
      );
    }

    return payload;
  }
}
