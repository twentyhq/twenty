import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

export type RecordShareRow = {
  principalId: string;
  principalType: string;
  accessLevel: string;
  rowCause: string;
  sourceId: string;
};

export const findRecordShares = (recordId: string): Promise<RecordShareRow[]> =>
  getCoreRepository<WorkspaceEntity>(WorkspaceEntity).manager.query(
    `SELECT "principalId", "principalType", "accessLevel", "rowCause", "sourceId"
     FROM "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."recordShare"
     WHERE "recordId" = $1 AND "deletedAt" IS NULL
     ORDER BY "sourceId", "rowCause"::text`,
    [recordId],
  );
