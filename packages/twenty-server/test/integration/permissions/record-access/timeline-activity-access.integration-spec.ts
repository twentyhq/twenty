/* @license Enterprise */

import { type ObjectRecordCreateEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { buildPermissionTestAuthContext } from 'test/integration/permissions/utils/build-permission-test-auth-context.util';
import { buildPermissionTestTimelineValue } from 'test/integration/permissions/utils/build-permission-test-timeline-value.util';
import { createPermissionTestTimelineFixture } from 'test/integration/permissions/utils/create-permission-test-timeline-fixture.util';
import { describePermissionTestWorkspace } from 'test/integration/permissions/utils/describe-permission-test-workspace.util';
import { expectPermissionDenied } from 'test/integration/permissions/utils/expect-permission-denied.util';
import {
  type PermissionTestTimelineFieldName,
  type PermissionTestTimelineFixture,
  type PermissionTestTimelineRecordName,
} from 'test/integration/permissions/utils/permission-test-timeline-fixture.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RecordEventPermissionsReadService } from 'src/engine/permissions/record-event-permissions-read.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const TIMELINE_FIELD_NAMES: PermissionTestTimelineFieldName[] = [
  'name',
  'summary',
];

const FIXTURE_TIMEOUT_MS = 120000;

const findTimelineActivityIdsOrThrow = ({
  fixture,
  record,
}: {
  fixture: Pick<PermissionTestTimelineFixture, 'timelineActivityIdsByRecord'>;
  record: PermissionTestTimelineRecordName;
}): string[] => {
  const timelineActivityIds = fixture.timelineActivityIdsByRecord.get(record);

  assertIsDefinedOrThrow(timelineActivityIds);

  return timelineActivityIds;
};

const findReadableFieldNames = ({
  serializedValue,
  record,
}: {
  serializedValue: string;
  record: PermissionTestTimelineRecordName;
}) =>
  TIMELINE_FIELD_NAMES.filter((fieldName) =>
    serializedValue.includes(
      buildPermissionTestTimelineValue({ record, fieldName }),
    ),
  );

describePermissionTestWorkspace({
  name: 'timeline activity access',
  defineTests: ({ findWorkspace }) => {
    let fixture: PermissionTestTimelineFixture;

    const findTimelineActivities = async ({
      token,
      records,
      gqlFields = 'id properties',
    }: {
      token: string;
      records: PermissionTestTimelineRecordName[];
      gqlFields?: string;
    }): Promise<(Record<string, unknown> & { id: string })[]> => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'timelineActivity',
          objectMetadataPluralName: 'timelineActivities',
          gqlFields,
          filter: {
            id: {
              in: records.flatMap((record) =>
                findTimelineActivityIdsOrThrow({ fixture, record }),
              ),
            },
          },
        }),
        token,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.timelineActivities.edges.map(
        ({ node }: { node: Record<string, unknown> & { id: string } }) => node,
      );
    };

    const findReadableTimelineValues = async ({
      token,
      records,
    }: {
      token: string;
      records: PermissionTestTimelineRecordName[];
    }) => {
      const timelineActivities = await findTimelineActivities({
        token,
        records,
      });

      return Object.fromEntries(
        records.map((record) => [
          record,
          findReadableFieldNames({
            serializedValue: JSON.stringify(
              timelineActivities.filter(({ id }) =>
                findTimelineActivityIdsOrThrow({ fixture, record }).includes(
                  id,
                ),
              ),
            ),
            record,
          }),
        ]),
      );
    };

    const findReadableTimelineEventValues = async (
      records: PermissionTestTimelineRecordName[],
    ) => {
      const workspace = findWorkspace();
      const timelineActivities = await findTimelineActivities({
        token: workspace.adminAccessToken,
        records,
        gqlFields: `id properties linkedObjectMetadataId linkedRecordId ${records
          .map((record) => fixture.targetColumnNameByRecord.get(record))
          .join(' ')}`,
      });
      const { flatObjectMetadataMaps } =
        await getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        ).getOrRecompute(workspace.workspaceId, ['flatObjectMetadataMaps']);
      const timelineActivityObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.timelineActivity.universalIdentifier
        ];

      assertIsDefinedOrThrow(timelineActivityObjectMetadata);

      const events: ObjectRecordCreateEvent[] = timelineActivities.map(
        (timelineActivity) => ({
          eventId: v4(),
          recordId: timelineActivity.id,
          properties: { after: timelineActivity },
        }),
      );

      const readableEvents =
        await getAppProviderByClassName<RecordEventPermissionsReadService>(
          'RecordEventPermissionsReadService',
        ).filterReadableEvents({
          authContext: await buildPermissionTestAuthContext({
            principals: {
              mainPrincipal: { type: 'apiKey', role: 'rowLevel' },
              limitingPrincipal: { type: 'none' },
              applicationPrincipal: { type: 'customApplication' },
            },
            workspace,
          }),
          eventBatch: {
            name: 'timelineActivity.created',
            workspaceId: workspace.workspaceId,
            objectMetadata: timelineActivityObjectMetadata,
            events,
          },
        });

      return Object.fromEntries(
        records.map((record) => [
          record,
          findReadableFieldNames({
            serializedValue: JSON.stringify(
              readableEvents.filter(({ recordId }) =>
                findTimelineActivityIdsOrThrow({ fixture, record }).includes(
                  recordId,
                ),
              ),
            ),
            record,
          }),
        ]),
      );
    };

    beforeAll(async () => {
      fixture = await createPermissionTestTimelineFixture(findWorkspace());
    }, FIXTURE_TIMEOUT_MS);

    it('should read every value with a role reading all records', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.allRecords,
          records: ['insideEveryFilter', 'outsideStatusFilter'],
        }),
      ).toEqual({
        insideEveryFilter: ['name', 'summary'],
        outsideStatusFilter: ['name', 'summary'],
      });
    });

    it('should read no value of an object the role cannot read', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.objectDenied,
          records: ['insideEveryFilter'],
        }),
      ).toEqual({ insideEveryFilter: [] });
    });

    it('should read the values of the records a row level rule keeps only', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.rowLevel,
          records: ['insideEveryFilter', 'outsideStatusFilter'],
        }),
      ).toEqual({
        insideEveryFilter: ['name', 'summary'],
        outsideStatusFilter: [],
      });
    });

    it('should not read a field the role cannot read', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.summaryDenied,
          records: ['insideEveryFilter'],
        }),
      ).toEqual({ insideEveryFilter: ['name'] });
    });

    it('should refuse a filter on properties for a role with a field it cannot read', async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'timelineActivity',
          objectMetadataPluralName: 'timelineActivities',
          gqlFields: 'id',
          filter: { properties: { like: '%Timeline summary%' } },
        }),
        fixture.tokens.summaryDenied,
      );

      expectPermissionDenied(response.body.errors);
    });

    it('should read the values when the role cannot read the timeline relation', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.timelineRelationDenied,
          records: ['insideEveryFilter'],
        }),
      ).toEqual({ insideEveryFilter: ['name', 'summary'] });
    });

    it('should read the values of a record shared with the role outside its row level rule', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.sharedRecord,
          records: ['insideEveryFilter', 'outsideStatusFilter'],
        }),
      ).toEqual({
        insideEveryFilter: ['name', 'summary'],
        outsideStatusFilter: ['name', 'summary'],
      });
    });

    it('should read the values of the records its access group reaches only', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.lowVisibilityTier,
          records: ['lowVisibilityTier', 'fullVisibilityTier'],
        }),
      ).toEqual({
        lowVisibilityTier: ['name', 'summary'],
        fullVisibilityTier: [],
      });
    });

    it('should read no value of a private record the role was not given', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.allRecords,
          records: ['privateRecord'],
        }),
      ).toEqual({ privateRecord: [] });
    });

    it('should read the values of the records a related record path reaches only', async () => {
      expect(
        await findReadableTimelineValues({
          token: fixture.tokens.rowLevel,
          records: ['itemOfReadableRecord', 'itemOfUnreadableRecord'],
        }),
      ).toEqual({
        itemOfReadableRecord: ['name', 'summary'],
        itemOfUnreadableRecord: [],
      });
    });

    it('should deliver timeline events with the values of the records a row level rule keeps only', async () => {
      expect(
        await findReadableTimelineEventValues([
          'insideEveryFilter',
          'outsideStatusFilter',
        ]),
      ).toEqual({
        insideEveryFilter: ['name', 'summary'],
        outsideStatusFilter: [],
      });
    });
  },
});
