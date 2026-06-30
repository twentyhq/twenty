const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

export const deleteRecordsByIds = async (
  objectNameSingular: string,
  recordIds: string[],
) => {
  if (!recordIds.length) {
    return;
  }

  try {
    // Create placeholders for parameterized query: $1, $2, $3, etc.
    const placeholders = recordIds
      .map((_, index) => `$${index + 1}`)
      .join(', ');

    await global.testDataSource.query(
      `DELETE from "${TEST_SCHEMA_NAME}"."${objectNameSingular}" WHERE id IN (${placeholders})`,
      recordIds,
    );
  } catch {
    /* empty */
  }
};
