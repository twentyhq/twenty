import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { type RecordShareRow } from 'test/integration/utils/find-record-shares.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

export const insertRecordShare = async ({
  objectNameSingular,
  recordId,
  share,
}: {
  objectNameSingular: string;
  recordId: string;
  share: RecordShareRow;
}): Promise<void> => {
  await getCoreRepository<WorkspaceEntity>(WorkspaceEntity).manager.query(
    `INSERT INTO "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."recordShare"
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     VALUES (
       (SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = $2),
       $3, $4, $5, $6, $7, $8
     )`,
    [
      SEED_APPLE_WORKSPACE_ID,
      objectNameSingular,
      recordId,
      share.principalId,
      share.principalType,
      share.accessLevel,
      share.rowCause,
      share.sourceId,
    ],
  );
};
