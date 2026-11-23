import { randomUUID } from 'node:crypto';

import { gql } from 'graphql-tag';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';
const FIRST_PAGE_SIZE = 50;

describe('callRecordingIdForCalendarEvent (integration)', () => {
  let restrictedApiKeyId: string | undefined;
  let restrictedApiKeyToken: string | undefined;
  let restrictedRoleId: string | undefined;
  let callRecordingObjectMetadataId: string | undefined;
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

  const queryAsRestrictedApiKey = () => {
    jestExpectToBeDefined(restrictedApiKeyToken);

    return makeMetadataApiRequest(
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
  };

  const queryCallRecordingIdForCalendarEvent = async () => {
    const response = await makeMetadataApiRequest({
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
    callRecordingObjectMetadataId = objects.find(
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

    const createApiKeyResponse = await makeMetadataApiRequest({
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

  it('falls back to the earliest non-terminal recording', async () => {
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

  it('skips a soft-deleted recording when selecting', async () => {
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."callRecording"
       SET "deletedAt" = now()
       WHERE id = $1`,
      [completedCallRecordingId],
    );

    await expect(queryCallRecordingIdForCalendarEvent()).resolves.toBe(
      processingCallRecordingId,
    );
  });

  it('denies selection without call recording read permission', async () => {
    const response = await queryAsRestrictedApiKey();

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

  describe('with a share on one recording', () => {
    let recordShares: RecordShareSystemWriteService;

    const setRecordSharingEnabled = (value: boolean) =>
      updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value,
        expectToFail: false,
      });

    beforeAll(async () => {
      jestExpectToBeDefined(callRecordingObjectMetadataId);
      jestExpectToBeDefined(restrictedRoleId);

      recordShares = getAppProviderByClassName<RecordShareSystemWriteService>(
        'RecordShareSystemWriteService',
      );
      await setRecordSharingEnabled(true);
      await recordShares.insertRecordShares({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        recordShares: [
          {
            recordId: processingCallRecordingId,
            objectMetadataId: callRecordingObjectMetadataId,
            principalId: restrictedRoleId,
            principalType: RecordSharePrincipalType.ROLE,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId: processingCallRecordingId,
          },
        ],
      });
    });

    afterAll(async () => {
      jestExpectToBeDefined(callRecordingObjectMetadataId);

      await recordShares.deleteRecordSharesByRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: callRecordingObjectMetadataId,
        recordIds: [processingCallRecordingId],
      });
      await setRecordSharingEnabled(false);
    });

    it('lets a caller reaching recordings only through shares select the shared one', async () => {
      const response = await queryAsRestrictedApiKey();

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.callRecordingIdForCalendarEvent).toBe(
        processingCallRecordingId,
      );
    });
  });
});
