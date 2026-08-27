import { randomUUID } from 'node:crypto';

import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';
const FIRST_PAGE_SIZE = 50;

describe('callRecordingIdForCalendarEvent (integration)', () => {
  const calendarEventId = randomUUID();
  const callRecordingIdPrefix = randomUUID().slice(0, 24);
  const callRecordingIds = Array.from(
    { length: FIRST_PAGE_SIZE + 2 },
    (_, index) =>
      `${callRecordingIdPrefix}${String(index + 1).padStart(12, '0')}`,
  );
  const failedCallRecordingIds = callRecordingIds.slice(0, FIRST_PAGE_SIZE);
  const processingCallRecordingId = callRecordingIds[FIRST_PAGE_SIZE];
  const completedCallRecordingId = callRecordingIds[FIRST_PAGE_SIZE + 1];

  const queryCallRecordingIdForCalendarEvent = async () => {
    const response = await makeMetadataAPIRequest({
      query: gql`
        query CallRecordingIdForCalendarEvent($calendarEventId: UUID!) {
          callRecordingIdForCalendarEvent(calendarEventId: $calendarEventId)
        }
      `,
      variables: { calendarEventId },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    return response.body.data.callRecordingIdForCalendarEvent as string | null;
  };

  beforeAll(async () => {
    await global.testDataSource.query(
      `INSERT INTO "${TEST_SCHEMA_NAME}"."calendarEvent" (id, title)
       VALUES ($1, $2)`,
      [calendarEventId, 'Call recording for calendar event integration test'],
    );

    await global.testDataSource.query(
      `INSERT INTO "${TEST_SCHEMA_NAME}"."callRecording"
         (id, "calendarEventId", status, "createdAt")
       SELECT
         input.id,
         $2,
         input.status::"${TEST_SCHEMA_NAME}"."callRecording_status_enum",
         $3
       FROM unnest($1::uuid[], $4::text[]) AS input(id, status)`,
      [
        callRecordingIds,
        calendarEventId,
        '2026-01-01T00:00:00.000Z',
        [
          ...failedCallRecordingIds.map(() => CallRecordingStatus.FAILED),
          CallRecordingStatus.PROCESSING,
          CallRecordingStatus.COMPLETED,
        ],
      ],
    );
  });

  beforeEach(async () => {
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."callRecording"
       SET status = $1
       WHERE id = ANY($2::uuid[])`,
      [CallRecordingStatus.FAILED, callRecordingIds],
    );
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."callRecording"
       SET status = CASE
         WHEN id = $1 THEN $2
         WHEN id = $3 THEN $4
         ELSE status
       END
       WHERE id = ANY($5::uuid[])`,
      [
        processingCallRecordingId,
        CallRecordingStatus.PROCESSING,
        completedCallRecordingId,
        CallRecordingStatus.COMPLETED,
        callRecordingIds,
      ],
    );
  });

  afterAll(async () => {
    await deleteRecordsByIds('callRecording', callRecordingIds);
    await deleteRecordsByIds('calendarEvent', [calendarEventId]);
  });

  it('selects a completed recording beyond the first page', async () => {
    await expect(queryCallRecordingIdForCalendarEvent()).resolves.toBe(
      completedCallRecordingId,
    );
  });

  it('falls back to the earliest in-progress recording', async () => {
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."callRecording"
       SET status = $1
       WHERE id = $2`,
      [CallRecordingStatus.FAILED, completedCallRecordingId],
    );

    await expect(queryCallRecordingIdForCalendarEvent()).resolves.toBe(
      processingCallRecordingId,
    );
  });

  it('falls back to the earliest recording of any status', async () => {
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."callRecording"
       SET status = $1
       WHERE id = ANY($2::uuid[])`,
      [
        CallRecordingStatus.FAILED,
        [processingCallRecordingId, completedCallRecordingId],
      ],
    );

    await expect(queryCallRecordingIdForCalendarEvent()).resolves.toBe(
      failedCallRecordingIds[0],
    );
  });
});
