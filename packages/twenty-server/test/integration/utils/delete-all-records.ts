const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

export const deleteAllRecords = async (objectNameSingular: string) => {
  await global.testDataSource.query(
    `DELETE from "${TEST_SCHEMA_NAME}"."${objectNameSingular}"`,
  );
};
