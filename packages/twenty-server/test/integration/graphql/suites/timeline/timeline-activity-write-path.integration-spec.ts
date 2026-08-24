import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { gql } from 'graphql-tag';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import {
  type TimelineActivityAction,
  type TimelineActivityTypeSnapshot,
} from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

const TIMELINE_ACTIVITY_GQL_FIELDS = `
  id
  happensAt
  timelineActivityTypeId
  timelineActivityTypeSnapshot
  properties
  linkedRecordId
  linkedRecordCachedName
  linkedObjectMetadataId
  targetCompanyId
  targetPersonId
  targetNoteId
  targetTaskId
`;

type TimelineActivityRow = {
  id: string;
  happensAt: string;
  timelineActivityTypeId: string;
  timelineActivityTypeSnapshot: TimelineActivityTypeSnapshot;
  properties: Record<string, unknown> | null;
  linkedRecordId: string | null;
  linkedRecordCachedName: string | null;
  linkedObjectMetadataId: string | null;
  targetCompanyId: string | null;
  targetPersonId: string | null;
  targetNoteId: string | null;
  targetTaskId: string | null;
};

const createRecord = async ({
  objectMetadataSingularName,
  data,
}: {
  objectMetadataSingularName: string;
  data: object;
}): Promise<void> => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const updateRecord = async ({
  objectMetadataSingularName,
  recordId,
  data,
}: {
  objectMetadataSingularName: string;
  recordId: string;
  data: object;
}): Promise<void> => {
  const response = await makeGraphqlAPIRequest(
    updateOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      recordId,
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const withOrmV2ReadPathSetting = async (
  enabled: boolean,
  callback: () => Promise<void>,
) => {
  await updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
    value: enabled,
    expectToFail: false,
  });

  try {
    await callback();
  } finally {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
      value: false,
      expectToFail: false,
    });
  }
};

const findTimelineActivities = async (
  filter: object,
): Promise<TimelineActivityRow[]> => {
  await waitForAllJobsToFinish();

  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter,
      orderBy: [{ createdAt: 'AscNullsFirst' }],
      first: 100,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.timelineActivities.edges.map(
    (edge: { node: TimelineActivityRow }) => edge.node,
  );
};

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const findTimelineActivityRowsByLinkedRecordId = async ({
  timelineActivityTypeId,
  linkedRecordId,
}: {
  timelineActivityTypeId: string;
  linkedRecordId: string;
}): Promise<Pick<TimelineActivityRow, 'targetCompanyId' | 'targetNoteId'>[]> =>
  global.testDataSource.query(
    `SELECT "targetCompanyId", "targetNoteId" FROM "${TEST_SCHEMA_NAME}"."timelineActivity" WHERE "timelineActivityTypeId" = $1 AND "linkedRecordId" = $2`,
    [timelineActivityTypeId, linkedRecordId],
  );

const FIND_MANY_TIMELINE_ACTIVITY_TYPES = gql`
  query FindManyTimelineActivityTypes {
    timelineActivityTypes {
      id
      action
      objectUniversalIdentifier
    }
  }
`;

// Mirrors the server resolver: several types share an action, and the one bound
// to the event's object wins over the shared one.
const timelineActivityTypeIdByObjectAndAction = new Map<string, string>();

const buildKey = (
  action: TimelineActivityAction,
  objectUniversalIdentifier: string | null,
): string => `${objectUniversalIdentifier ?? 'shared'}|${action}`;

const timelineActivityTypeIdForOrThrow = (
  action: TimelineActivityAction,
  objectUniversalIdentifier: string | null = null,
): string => {
  const timelineActivityTypeId =
    timelineActivityTypeIdByObjectAndAction.get(
      buildKey(action, objectUniversalIdentifier),
    ) ?? timelineActivityTypeIdByObjectAndAction.get(buildKey(action, null));

  if (!isDefined(timelineActivityTypeId)) {
    throw new Error(`No timeline activity type seeded for action ${action}`);
  }

  return timelineActivityTypeId;
};

const NOTE_UNIVERSAL_IDENTIFIER = STANDARD_OBJECTS.note.universalIdentifier;
const MESSAGE_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.universalIdentifier;
const CALENDAR_EVENT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.universalIdentifier;
const ATTACHMENT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.attachment.universalIdentifier;

const COMPANY_ID = '20202020-7171-4000-8000-000000000001';
const POSITION_COMPANY_ID = '20202020-7171-4000-8000-000000000002';
const LEGACY_COMPOSITE_COMPANY_ID = '20202020-7171-4000-8000-000000000003';
const NOTE_COMPANY_ID = '20202020-7171-4000-8000-000000000004';
const NOTE_ID = '20202020-7171-4000-8000-000000000005';
const NOTE_TARGET_ID = '20202020-7171-4000-8000-000000000006';
const MESSAGE_LIST_ID = '20202020-7171-4000-8000-000000000007';
const ROUTED_PERSON_ID = '20202020-7171-4000-8000-000000000010';
const ROUTED_MESSAGE_THREAD_ID = '20202020-7171-4000-8000-000000000011';
const ROUTED_MESSAGE_ID = '20202020-7171-4000-8000-000000000012';
const ROUTED_MESSAGE_PARTICIPANT_ID = '20202020-7171-4000-8000-000000000013';
const ROUTED_CALENDAR_EVENT_ID = '20202020-7171-4000-8000-000000000014';
const ROUTED_CALENDAR_EVENT_PARTICIPANT_ID =
  '20202020-7171-4000-8000-000000000015';
const ATTACHMENT_ID = '20202020-7171-4000-8000-000000000016';
const ORM_V2_COMPOSITE_COMPANY_ID = '20202020-7171-4000-8000-000000000017';
const BATCH_COMPANY_IDS = [
  '20202020-7171-4000-8000-000000000008',
  '20202020-7171-4000-8000-000000000009',
];

const CREATED_RECORD_IDS: { objectMetadataSingularName: string; id: string }[] =
  [
    { objectMetadataSingularName: 'attachment', id: ATTACHMENT_ID },
    {
      objectMetadataSingularName: 'calendarEventParticipant',
      id: ROUTED_CALENDAR_EVENT_PARTICIPANT_ID,
    },
    {
      objectMetadataSingularName: 'calendarEvent',
      id: ROUTED_CALENDAR_EVENT_ID,
    },
    {
      objectMetadataSingularName: 'messageParticipant',
      id: ROUTED_MESSAGE_PARTICIPANT_ID,
    },
    { objectMetadataSingularName: 'message', id: ROUTED_MESSAGE_ID },
    {
      objectMetadataSingularName: 'messageThread',
      id: ROUTED_MESSAGE_THREAD_ID,
    },
    { objectMetadataSingularName: 'person', id: ROUTED_PERSON_ID },
    { objectMetadataSingularName: 'noteTarget', id: NOTE_TARGET_ID },
    { objectMetadataSingularName: 'note', id: NOTE_ID },
    { objectMetadataSingularName: 'messageList', id: MESSAGE_LIST_ID },
    ...BATCH_COMPANY_IDS.map((id) => ({
      objectMetadataSingularName: 'company',
      id,
    })),
    { objectMetadataSingularName: 'company', id: NOTE_COMPANY_ID },
    {
      objectMetadataSingularName: 'company',
      id: LEGACY_COMPOSITE_COMPANY_ID,
    },
    {
      objectMetadataSingularName: 'company',
      id: ORM_V2_COMPOSITE_COMPANY_ID,
    },
    { objectMetadataSingularName: 'company', id: POSITION_COMPANY_ID },
    { objectMetadataSingularName: 'company', id: COMPANY_ID },
  ];

describe('timeline activity write path (integration)', () => {
  beforeAll(async () => {
    const response = await makeMetadataAPIRequest({
      query: FIND_MANY_TIMELINE_ACTIVITY_TYPES,
    });

    expect(response.body.errors).toBeUndefined();

    for (const { id, action, objectUniversalIdentifier } of response.body.data
      .timelineActivityTypes) {
      if (isDefined(action)) {
        timelineActivityTypeIdByObjectAndAction.set(
          buildKey(
            action as TimelineActivityAction,
            objectUniversalIdentifier ?? null,
          ),
          id,
        );
      }
    }
  });

  afterAll(async () => {
    for (const { objectMetadataSingularName, id } of CREATED_RECORD_IDS) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  describe('a record own events', () => {
    it('should write a created entry on the record own timeline', async () => {
      await createRecord({
        objectMetadataSingularName: 'company',
        data: {
          id: COMPANY_ID,
          name: 'Timeline Write Path',
        },
      });

      const timelineActivities = await findTimelineActivities({
        targetCompanyId: { eq: COMPANY_ID },
      });

      expect(timelineActivities).toHaveLength(1);
      expect(timelineActivities[0].timelineActivityTypeId).toBe(
        timelineActivityTypeIdForOrThrow('created'),
      );
      expect(timelineActivities[0].timelineActivityTypeSnapshot).toMatchObject({
        id: timelineActivityTypeIdForOrThrow('created'),
        action: 'created',
      });
      expect(timelineActivities[0].targetCompanyId).toBe(COMPANY_ID);
      expect(timelineActivities[0].linkedRecordId).toBeNull();
    });

    it('should write an updated entry holding the field diff', async () => {
      await updateRecord({
        objectMetadataSingularName: 'company',
        recordId: COMPANY_ID,
        data: {
          name: 'Timeline Write Path Renamed',
        },
      });

      const timelineActivities = await findTimelineActivities({
        targetCompanyId: { eq: COMPANY_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow('updated'),
        },
      });

      expect(timelineActivities).toHaveLength(1);
      expect(timelineActivities[0].properties).toEqual({
        diff: {
          name: {
            before: 'Timeline Write Path',
            after: 'Timeline Write Path Renamed',
          },
        },
      });
    });

    it.each([
      {
        companyId: LEGACY_COMPOSITE_COMPANY_ID,
        isOrmV2ReadPathEnabled: false,
        ormName: 'legacy ORM',
      },
      {
        companyId: ORM_V2_COMPOSITE_COMPANY_ID,
        isOrmV2ReadPathEnabled: true,
        ormName: 'ORM v2',
      },
    ])(
      'should write an updated entry for a $ormName composite field change',
      async ({ companyId, isOrmV2ReadPathEnabled }) => {
        await withOrmV2ReadPathSetting(isOrmV2ReadPathEnabled, async () => {
          await createRecord({
            objectMetadataSingularName: 'company',
            data: {
              id: companyId,
              name: 'Composite Field Timeline',
            },
          });

          const updateStartedAt = Date.now();

          await updateRecord({
            objectMetadataSingularName: 'company',
            recordId: companyId,
            data: {
              address: {
                addressStreet1: '234 Composite Street',
                addressStreet2: '',
                addressCity: 'Paris',
                addressState: '',
                addressCountry: '',
                addressPostcode: '',
                addressLat: null,
                addressLng: null,
              },
            },
          });

          const timelineActivities = await findTimelineActivities({
            targetCompanyId: { eq: companyId },
            timelineActivityTypeId: {
              eq: timelineActivityTypeIdForOrThrow('updated'),
            },
          });

          expect(timelineActivities).toHaveLength(1);
          expect(
            new Date(timelineActivities[0].happensAt).getTime(),
          ).toBeGreaterThanOrEqual(updateStartedAt);
          expect(timelineActivities[0].properties).toMatchObject({
            diff: {
              address: {
                before: {
                  addressStreet1: '',
                  addressCity: '',
                },
                after: {
                  addressStreet1: '234 Composite Street',
                  addressCity: 'Paris',
                },
              },
            },
          });
        });
      },
    );

    it('should merge every record of a multi record batch', async () => {
      for (const [index, id] of BATCH_COMPANY_IDS.entries()) {
        await createRecord({
          objectMetadataSingularName: 'company',
          data: { id, name: `Batch ${index}` },
        });
      }

      const updateBatchTo = async (name: string) => {
        const response = await makeGraphqlAPIRequest(
          updateManyOperationFactory({
            objectMetadataSingularName: 'company',
            objectMetadataPluralName: 'companies',
            gqlFields: 'id',
            data: { name },
            filter: { id: { in: BATCH_COMPANY_IDS } },
          }),
        );

        expect(response.body.errors).toBeUndefined();
      };

      await updateBatchTo('Batch renamed once');
      await waitForAllJobsToFinish();

      await updateBatchTo('Batch renamed twice');

      for (const [index, id] of BATCH_COMPANY_IDS.entries()) {
        const timelineActivities = await findTimelineActivities({
          targetCompanyId: { eq: id },
          timelineActivityTypeId: {
            eq: timelineActivityTypeIdForOrThrow('updated'),
          },
        });

        expect(timelineActivities).toHaveLength(1);
        expect(timelineActivities[0].properties).toEqual({
          diff: {
            name: { before: `Batch ${index}`, after: 'Batch renamed twice' },
          },
        });
      }
    });

    it('should not write an entry for a position only change', async () => {
      await createRecord({
        objectMetadataSingularName: 'company',
        data: {
          id: POSITION_COMPANY_ID,
          name: 'Position Only',
        },
      });

      await updateRecord({
        objectMetadataSingularName: 'company',
        recordId: POSITION_COMPANY_ID,
        data: { position: 12345 },
      });

      const timelineActivities = await findTimelineActivities({
        targetCompanyId: { eq: POSITION_COMPANY_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow('updated'),
        },
      });

      expect(timelineActivities).toHaveLength(0);
    });
  });

  describe('note linked to a company', () => {
    it('should write a linked entry on the company when the note target is created', async () => {
      await createRecord({
        objectMetadataSingularName: 'company',
        data: {
          id: NOTE_COMPANY_ID,
          name: 'Note Host',
        },
      });
      await createRecord({
        objectMetadataSingularName: 'note',
        data: { id: NOTE_ID, title: 'Linked note' },
      });
      await createRecord({
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: NOTE_TARGET_ID,
          noteId: NOTE_ID,
          targetCompanyId: NOTE_COMPANY_ID,
        },
      });

      const timelineActivities = await findTimelineActivities({
        targetCompanyId: { eq: NOTE_COMPANY_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow(
            'linked',
            NOTE_UNIVERSAL_IDENTIFIER,
          ),
        },
      });

      expect(timelineActivities).toHaveLength(1);
      expect(timelineActivities[0].timelineActivityTypeSnapshot).toMatchObject({
        id: timelineActivityTypeIdForOrThrow(
          'linked',
          NOTE_UNIVERSAL_IDENTIFIER,
        ),
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      });
      expect(timelineActivities[0].linkedRecordId).toBe(NOTE_ID);
      expect(timelineActivities[0].linkedRecordCachedName).toBe('Linked note');
      expect(timelineActivities[0].linkedObjectMetadataId).not.toBeNull();
    });

    it('should write the note own created entry on the note timeline', async () => {
      const timelineActivities = await findTimelineActivities({
        targetNoteId: { eq: NOTE_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow('created'),
        },
      });

      expect(timelineActivities).toHaveLength(1);
    });

    it('should write a linked entry on the company when the note title changes', async () => {
      await updateRecord({
        objectMetadataSingularName: 'note',
        recordId: NOTE_ID,
        data: { title: 'Linked note renamed' },
      });

      const onCompany = await findTimelineActivities({
        targetCompanyId: { eq: NOTE_COMPANY_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow(
            'updated',
            NOTE_UNIVERSAL_IDENTIFIER,
          ),
        },
      });

      expect(onCompany).toHaveLength(1);
      expect(onCompany[0].linkedRecordId).toBe(NOTE_ID);
      expect(onCompany[0].linkedRecordCachedName).toBe('Linked note renamed');
      expect(onCompany[0].properties).toEqual({
        diff: {
          title: { before: 'Linked note', after: 'Linked note renamed' },
        },
      });

      const rowsWithoutTarget = (
        await findTimelineActivityRowsByLinkedRecordId({
          timelineActivityTypeId: timelineActivityTypeIdForOrThrow(
            'updated',
            NOTE_UNIVERSAL_IDENTIFIER,
          ),
          linkedRecordId: NOTE_ID,
        })
      ).filter((row) => row.targetCompanyId === null);

      expect(rowsWithoutTarget).toHaveLength(0);
    });

    // The note rule only fans out on its trigger field, so editing the body
    // leaves the linked timelines alone.
    it('should not write a linked entry when a non trigger field changes', async () => {
      await updateRecord({
        objectMetadataSingularName: 'note',
        recordId: NOTE_ID,
        data: {
          bodyV2: { blocknote: null, markdown: 'Body only change' },
        },
      });

      const onCompany = await findTimelineActivities({
        targetCompanyId: { eq: NOTE_COMPANY_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow(
            'updated',
            NOTE_UNIVERSAL_IDENTIFIER,
          ),
        },
      });

      expect(onCompany).toHaveLength(1);
      expect(onCompany[0].properties).toEqual({
        diff: {
          title: { before: 'Linked note', after: 'Linked note renamed' },
        },
      });
    });

    it('should write a linked entry on the company when the note target is deleted', async () => {
      await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'noteTarget',
          gqlFields: 'id',
          recordId: NOTE_TARGET_ID,
        }),
      );

      const timelineActivities = await findTimelineActivities({
        targetCompanyId: { eq: NOTE_COMPANY_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow(
            'unlinked',
            NOTE_UNIVERSAL_IDENTIFIER,
          ),
        },
      });

      expect(timelineActivities).toHaveLength(1);
      expect(timelineActivities[0].linkedRecordId).toBe(NOTE_ID);
    });
  });

  describe('metadata-declared junction routing', () => {
    it('should route message and calendar event links through the generic rule engine', async () => {
      await createRecord({
        objectMetadataSingularName: 'person',
        data: {
          id: ROUTED_PERSON_ID,
          name: { firstName: 'Generic', lastName: 'Target' },
        },
      });
      await createRecord({
        objectMetadataSingularName: 'messageThread',
        data: { id: ROUTED_MESSAGE_THREAD_ID },
      });
      await createRecord({
        objectMetadataSingularName: 'message',
        data: {
          id: ROUTED_MESSAGE_ID,
          messageThreadId: ROUTED_MESSAGE_THREAD_ID,
          subject: 'Generic message routing',
          text: 'No specialized listener required',
          receivedAt: new Date().toISOString(),
        },
      });
      await createRecord({
        objectMetadataSingularName: 'messageParticipant',
        data: {
          id: ROUTED_MESSAGE_PARTICIPANT_ID,
          messageId: ROUTED_MESSAGE_ID,
          role: 'TO',
          handle: 'generic.target@example.com',
          displayName: 'Generic Target',
        },
      });
      await updateRecord({
        objectMetadataSingularName: 'messageParticipant',
        recordId: ROUTED_MESSAGE_PARTICIPANT_ID,
        data: { personId: ROUTED_PERSON_ID },
      });

      const messageActivities = await findTimelineActivities({
        targetPersonId: { eq: ROUTED_PERSON_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow(
            'linked',
            MESSAGE_UNIVERSAL_IDENTIFIER,
          ),
        },
      });

      expect(messageActivities).toHaveLength(1);
      expect(messageActivities[0]).toMatchObject({
        linkedRecordId: ROUTED_MESSAGE_ID,
        linkedRecordCachedName: 'Generic message routing',
      });

      await updateRecord({
        objectMetadataSingularName: 'messageParticipant',
        recordId: ROUTED_MESSAGE_PARTICIPANT_ID,
        data: { handle: 'refreshed.target@example.com' },
      });

      expect(
        await findTimelineActivities({
          targetPersonId: { eq: ROUTED_PERSON_ID },
          timelineActivityTypeId: {
            eq: timelineActivityTypeIdForOrThrow(
              'linked',
              MESSAGE_UNIVERSAL_IDENTIFIER,
            ),
          },
        }),
      ).toHaveLength(1);

      await createRecord({
        objectMetadataSingularName: 'calendarEvent',
        data: {
          id: ROUTED_CALENDAR_EVENT_ID,
          title: 'Generic calendar routing',
          isFullDay: false,
          startsAt: new Date().toISOString(),
          endsAt: new Date().toISOString(),
        },
      });
      await createRecord({
        objectMetadataSingularName: 'calendarEventParticipant',
        data: {
          id: ROUTED_CALENDAR_EVENT_PARTICIPANT_ID,
          calendarEventId: ROUTED_CALENDAR_EVENT_ID,
          handle: 'generic.target@example.com',
          displayName: 'Generic Target',
          responseStatus: 'ACCEPTED',
          isOrganizer: false,
        },
      });
      await updateRecord({
        objectMetadataSingularName: 'calendarEventParticipant',
        recordId: ROUTED_CALENDAR_EVENT_PARTICIPANT_ID,
        data: { personId: ROUTED_PERSON_ID },
      });

      const calendarActivities = await findTimelineActivities({
        targetPersonId: { eq: ROUTED_PERSON_ID },
        timelineActivityTypeId: {
          eq: timelineActivityTypeIdForOrThrow(
            'linked',
            CALENDAR_EVENT_UNIVERSAL_IDENTIFIER,
          ),
        },
      });

      expect(calendarActivities).toHaveLength(1);
      expect(calendarActivities[0]).toMatchObject({
        linkedRecordId: ROUTED_CALENDAR_EVENT_ID,
        linkedRecordCachedName: 'Generic calendar routing',
      });
    });
  });

  describe('metadata-declared direct relation routing', () => {
    it('routes attachment link lifecycle events without attachment-specific code', async () => {
      await createRecord({
        objectMetadataSingularName: 'attachment',
        data: {
          id: ATTACHMENT_ID,
          name: 'proposal.pdf',
          targetCompanyId: NOTE_COMPANY_ID,
        },
      });

      const linkedTypeId = timelineActivityTypeIdForOrThrow(
        'linked',
        ATTACHMENT_UNIVERSAL_IDENTIFIER,
      );
      const unlinkedTypeId = timelineActivityTypeIdForOrThrow(
        'unlinked',
        ATTACHMENT_UNIVERSAL_IDENTIFIER,
      );
      const firstTargetActivities = await findTimelineActivities({
        targetCompanyId: { eq: NOTE_COMPANY_ID },
        timelineActivityTypeId: { eq: linkedTypeId },
      });

      expect(firstTargetActivities).toHaveLength(1);
      expect(firstTargetActivities[0]).toMatchObject({
        linkedRecordId: ATTACHMENT_ID,
        linkedRecordCachedName: 'proposal.pdf',
      });

      await updateRecord({
        objectMetadataSingularName: 'attachment',
        recordId: ATTACHMENT_ID,
        data: { name: 'proposal-final.pdf' },
      });

      expect(
        await findTimelineActivities({
          targetCompanyId: { eq: NOTE_COMPANY_ID },
          timelineActivityTypeId: { eq: linkedTypeId },
        }),
      ).toHaveLength(1);

      await updateRecord({
        objectMetadataSingularName: 'attachment',
        recordId: ATTACHMENT_ID,
        data: { targetCompanyId: COMPANY_ID },
      });

      expect(
        await findTimelineActivities({
          targetCompanyId: { eq: NOTE_COMPANY_ID },
          timelineActivityTypeId: { eq: unlinkedTypeId },
        }),
      ).toHaveLength(1);

      const secondTargetActivities = await findTimelineActivities({
        targetCompanyId: { eq: COMPANY_ID },
        timelineActivityTypeId: { eq: linkedTypeId },
      });

      expect(secondTargetActivities).toHaveLength(1);
      expect(secondTargetActivities[0].linkedRecordCachedName).toBe(
        'proposal-final.pdf',
      );

      const deleteResponse = await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id',
          recordId: ATTACHMENT_ID,
        }),
      );

      expect(deleteResponse.body.errors).toBeUndefined();
      expect(
        await findTimelineActivities({
          targetCompanyId: { eq: COMPANY_ID },
          timelineActivityTypeId: { eq: unlinkedTypeId },
        }),
      ).toHaveLength(1);
    });
  });

  describe('system objects', () => {
    it('should not write any entry for a system object outside the allowlist', async () => {
      await createRecord({
        objectMetadataSingularName: 'messageList',
        data: {
          id: MESSAGE_LIST_ID,
          name: 'Timeline Gate List',
        },
      });

      const timelineActivities = await findTimelineActivities({
        targetMessageListId: { eq: MESSAGE_LIST_ID },
      });

      expect(timelineActivities).toHaveLength(0);
    });
  });
});
