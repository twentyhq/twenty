import { randomUUID } from 'node:crypto';

import { gql } from 'graphql-tag';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';
const FIRST_PAGE_SIZE = 50;

describe('callRecordingIdForCalendarEvent (integration)', () => {
  let restrictedApiKeyId: string | undefined;
  let restrictedApiKeyToken: string | undefined;
  let restrictedRoleId: string | undefined;
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

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });
    const callRecordingObjectMetadataId = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'callRecording',
    )?.id;

    jestExpectToBeDefined(callRecordingObjectMetadataId);

    const { data: restrictedRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Call Recording Selection Restricted Role',
        description: 'API-key role without call recording read access',
        icon: 'IconKey',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: true,
      },
    });

    restrictedRoleId = restrictedRoleData?.createOneRole?.id;
    jestExpectToBeDefined(restrictedRoleId);

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: restrictedRoleId,
        objectPermissions: [
          {
            objectMetadataId: callRecordingObjectMetadataId,
            canReadObjectRecords: false,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });

    const createApiKeyResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateApiKey($input: CreateApiKeyInput!) {
          createApiKey(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          name: 'Call recording selection restricted key',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          roleId: restrictedRoleId,
        },
      },
    });

    restrictedApiKeyId = createApiKeyResponse.body.data?.createApiKey?.id;
    jestExpectToBeDefined(restrictedApiKeyId);

    const tokenResponse = await generateApiKeyToken({
      apiKeyId: restrictedApiKeyId,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    restrictedApiKeyToken = tokenResponse.body.data?.generateApiKeyToken?.token;
    jestExpectToBeDefined(restrictedApiKeyToken);
  });

  beforeEach(async () => {
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."callRecording"
       SET status = $1, "deletedAt" = NULL
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

    if (isDefined(restrictedApiKeyId)) {
      await global.testDataSource.query(
        'DELETE FROM core."apiKey" WHERE id = $1',
        [restrictedApiKeyId],
      );
    }

    if (isDefined(restrictedRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: restrictedRoleId },
      });
    }
  });

  it('selects a completed recording beyond the first page', async () => {
    await expect(queryCallRecordingIdForCalendarEvent()).resolves.toBe(
      completedCallRecordingId,
    );
  });

  it('returns null when no completed recording exists', async () => {
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."callRecording"
       SET status = $1
       WHERE id = $2`,
      [CallRecordingStatus.FAILED, completedCallRecordingId],
    );

    await expect(queryCallRecordingIdForCalendarEvent()).resolves.toBeNull();
  });

  it('skips a soft-deleted recording when selecting', async () => {
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."callRecording"
       SET "deletedAt" = now()
       WHERE id = $1`,
      [completedCallRecordingId],
    );

    await expect(queryCallRecordingIdForCalendarEvent()).resolves.toBeNull();
  });

  it('denies selection without call recording read permission', async () => {
    jestExpectToBeDefined(restrictedApiKeyToken);

    const response = await makeMetadataAPIRequest(
      {
        query: gql`
          query CallRecordingIdForCalendarEvent($calendarEventId: UUID!) {
            callRecordingIdForCalendarEvent(calendarEventId: $calendarEventId)
          }
        `,
        variables: { calendarEventId },
      },
      restrictedApiKeyToken,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.callRecordingIdForCalendarEvent).toBeNull();
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'FORBIDDEN',
            subCode: 'PERMISSION_DENIED',
          }),
        }),
      ]),
    );
  });
});
