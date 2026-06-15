import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
export const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

export const deleteAllRecords = async (objectNameSingular: string) => {
  await global.testDataSource.query(
    `DELETE from "${TEST_SCHEMA_NAME}"."${objectNameSingular}"`,
  );
};
