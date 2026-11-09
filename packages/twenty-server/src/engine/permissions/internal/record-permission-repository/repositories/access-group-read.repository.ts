/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';

@Injectable()
export class AccessGroupReadRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findCompactIdsByGroupHashes({
    workspaceId,
    groupHashes,
  }: {
    workspaceId: string;
    groupHashes: string[];
  }): Promise<number[]> {
    const rows = await this.recordPermissionQueryService.execute<{
      compactId: number;
    }>({
      workspaceId,
      query: {
        sql: `SELECT "compactId" FROM ${buildAccessGroupTableExpression(workspaceId)} WHERE "groupHash" = ANY(:groupHashes)`,
        parameters: { groupHashes },
      },
    });

    return rows.map(({ compactId }) => compactId);
  }
}
