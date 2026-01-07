import { Logger } from '@nestjs/common';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { prefillCompanies } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-companies';
import { prefillPeople } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-people';
import { prefillWorkflows } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workflows';

const logger = new Logger('PrefillWorkspaceDataWithTransaction');

export const prefillCreatedWorkspaceRecords = async ({
  globalWorkspaceOrmManager,
  workspaceId,
  schemaName,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  workspaceId: string;
  schemaName: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Promise<void> => {
  const authContext = buildSystemAuthContext(workspaceId);

  await globalWorkspaceOrmManager.executeInWorkspaceContext(
    authContext,
    async () => {
      const workspaceDataSource =
        await globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

      const queryRunner = workspaceDataSource.createQueryRunner();

      await queryRunner.connect();

      try {
        await queryRunner.startTransaction();

        await prefillCompanies(queryRunner.manager, schemaName);

        await prefillPeople(queryRunner.manager, schemaName);

        await prefillWorkflows(
          queryRunner.manager,
          schemaName,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        );

        await queryRunner.commitTransaction();
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          try {
            await queryRunner.rollbackTransaction();
          } catch (rollbackError) {
            logger.error(
              `Failed to rollback prefill transaction: ${rollbackError.message}`,
            );
          }
        }
        throw error;
      } finally {
        await queryRunner.release();
      }
    },
  );
};

