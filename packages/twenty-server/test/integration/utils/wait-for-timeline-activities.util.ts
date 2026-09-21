import { expectEventually } from 'test/integration/utils/expect-eventually.util';

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

// Timeline activities are inserted by listeners after the mutation resolves;
// mutating a record while its activities are still in flight races those inserts.
export const waitForTimelineActivities = async (
  targetColumnName: 'targetCompanyId' | 'targetPersonId',
  recordIds: string[],
) => {
  await expectEventually(async () => {
    const [{ count }] = await global.testDataSource.query(
      `SELECT count(DISTINCT "${targetColumnName}")::int AS count FROM "${TEST_SCHEMA_NAME}"."timelineActivity" WHERE "${targetColumnName}" = ANY($1)`,
      [recordIds],
    );

    expect(count).toBe(recordIds.length);
  });
};
