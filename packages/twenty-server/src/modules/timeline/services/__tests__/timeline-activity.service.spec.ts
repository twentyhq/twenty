import { ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { type ResolvedTimelineActivityType } from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const SOURCE_RECORD_ID = '20202020-0000-4000-8000-000000000002';
const OLD_TARGET_RECORD_ID = '20202020-0000-4000-8000-000000000003';
const NEW_TARGET_RECORD_ID = '20202020-0000-4000-8000-000000000004';
const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000005';
const EVENT_DATE = '2026-08-23T09:00:00.000Z';

const SOURCE_OBJECT = getFlatObjectMetadataMock({
  id: 'source-object-id',
  universalIdentifier: 'source-object-universal-identifier',
  nameSingular: 'attachment',
});

const EMPTY_FLAT_FIELD_METADATA_MAPS = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

const buildTimelineActivityType = (
  action: TimelineActivityTypeSnapshot['action'],
): ResolvedTimelineActivityType => {
  const id = `timeline-activity-type-${action}`;

  return {
    id,
    applicationId: 'application-id',
    snapshot: {
      id,
      universalIdentifier: `${id}-universal-identifier`,
      name: `${action}Attachment`,
      label: `${action} an attachment`,
      action,
      icon: 'IconPaperclip',
      objectUniversalIdentifier: SOURCE_OBJECT.universalIdentifier,
      frontComponentUniversalIdentifier: null,
    },
  };
};

const buildEvent = ({
  before,
  after,
  diff,
  updatedFields,
}: {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  diff?: ObjectRecordBaseEvent<Record<string, unknown>>['properties']['diff'];
  updatedFields?: string[];
}): ObjectRecordBaseEvent<Record<string, unknown>> => {
  const event = new ObjectRecordBaseEvent<Record<string, unknown>>();

  event.recordId = SOURCE_RECORD_ID;
  event.workspaceMemberId = WORKSPACE_MEMBER_ID;
  event.properties = { before, after, diff, updatedFields };

  return event;
};

const buildRule = ({
  action,
  targetShape,
}: Pick<TimelineActivityRule, 'targetShape'> & {
  action: TimelineActivityTypeSnapshot['action'];
}): TimelineActivityRule => ({
  sourceFlatObjectMetadata: SOURCE_OBJECT,
  actions: action === null ? [] : [action],
  timelineActivityType: buildTimelineActivityType(action),
  triggerFieldNames: null,
  targetShape,
});

const buildService = ({
  sourceRules = [],
  junctionRules = [],
}: {
  sourceRules?: TimelineActivityRule[];
  junctionRules?: TimelineActivityRule[];
}) => {
  const upsertTimelineActivities = jest.fn().mockResolvedValue(undefined);
  const resolveTimelineActivityType = jest.fn();
  const getRulesForEventBatch = jest.fn().mockResolvedValue({
    sourceRules,
    junctionRules,
    flatFieldMetadataMaps: EMPTY_FLAT_FIELD_METADATA_MAPS,
    resolveTimelineActivityType,
  });
  const resolveTargetsBySourceRecordId = jest.fn().mockResolvedValue(new Map());
  const resolveTargetFromDirectRelationRecord = jest.fn(
    ({ record }: { record?: Record<string, unknown> }) =>
      typeof record?.targetPersonId === 'string'
        ? {
            targetObjectNameSingular: 'person',
            targetRecordId: record.targetPersonId,
          }
        : undefined,
  );
  const resolveTargetFromJunctionRecord = jest.fn(
    ({ junctionRecord }: { junctionRecord?: Record<string, unknown> }) =>
      typeof junctionRecord?.targetPersonId === 'string'
        ? {
            targetObjectNameSingular: 'person',
            targetRecordId: junctionRecord.targetPersonId,
          }
        : undefined,
  );
  const findSourceRecordsByRecordId = jest
    .fn()
    .mockResolvedValue(
      new Map([
        [
          SOURCE_RECORD_ID,
          { id: SOURCE_RECORD_ID, name: 'Quarterly report.pdf' },
        ],
      ]),
    );
  const report = jest.fn();

  const service = new TimelineActivityService(
    { upsertTimelineActivities } as never,
    {
      executeInWorkspaceContext: jest.fn(
        async (callback: () => Promise<TimelineActivityPayload[][]>) =>
          callback(),
      ),
    } as never,
    { getRulesForEventBatch } as never,
    {
      resolveTargetsBySourceRecordId,
      resolveTargetFromDirectRelationRecord,
      resolveTargetFromJunctionRecord,
      findSourceRecordsByRecordId,
    } as never,
    { report } as never,
  );

  return {
    service,
    upsertTimelineActivities,
    resolveTimelineActivityType,
    resolveTargetsBySourceRecordId,
    findSourceRecordsByRecordId,
    report,
  };
};

const upsertEvent = async ({
  service,
  action,
  event,
}: {
  service: TimelineActivityService;
  action: 'created' | 'updated' | 'deleted';
  event: ObjectRecordBaseEvent;
}) =>
  service.upsertEvents({
    name: `attachment.${action}`,
    workspaceId: WORKSPACE_ID,
    objectMetadata: SOURCE_OBJECT,
    events: [event],
  });

describe('TimelineActivityService', () => {
  it('writes a self activity with only the displayable update diff', async () => {
    const timelineActivityType = buildTimelineActivityType('updated');
    const rule: TimelineActivityRule = {
      sourceFlatObjectMetadata: SOURCE_OBJECT,
      actions: ['updated'],
      triggerFieldNames: null,
      targetShape: { kind: 'SELF' },
    };
    const { service, upsertTimelineActivities, resolveTimelineActivityType } =
      buildService({ sourceRules: [rule] });

    resolveTimelineActivityType.mockReturnValue(timelineActivityType);

    await upsertEvent({
      service,
      action: 'updated',
      event: buildEvent({
        after: { id: SOURCE_RECORD_ID, updatedAt: EVENT_DATE },
        diff: { name: { before: 'Before', after: 'After' } },
      }),
    });

    expect(upsertTimelineActivities).toHaveBeenCalledTimes(1);
    expect(upsertTimelineActivities).toHaveBeenCalledWith({
      objectSingularName: 'attachment',
      workspaceId: WORKSPACE_ID,
      payloads: [
        {
          timelineActivityTypeId: timelineActivityType.id,
          timelineActivityTypeSnapshot: timelineActivityType.snapshot,
          happensAt: new Date(EVENT_DATE),
          objectSingularName: 'attachment',
          recordId: SOURCE_RECORD_ID,
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          properties: {
            diff: { name: { before: 'Before', after: 'After' } },
          },
        },
      ],
    });
  });

  it('fans a source update out through every junction target', async () => {
    const rule = buildRule({
      action: 'updated',
      targetShape: {
        kind: 'JUNCTION',
        junctionObjectMetadataId: 'junction-object-id',
        junctionObjectNameSingular: 'attachmentTarget',
        junctionSourceJoinColumnName: 'attachmentId',
        targetJoinColumns: [
          {
            joinColumnName: 'targetPersonId',
            targetObjectNameSingular: 'person',
          },
        ],
      },
    });
    const {
      service,
      upsertTimelineActivities,
      resolveTargetsBySourceRecordId,
    } = buildService({ sourceRules: [rule] });

    resolveTargetsBySourceRecordId.mockResolvedValue(
      new Map([
        [
          SOURCE_RECORD_ID,
          [
            {
              targetObjectNameSingular: 'person',
              targetRecordId: OLD_TARGET_RECORD_ID,
            },
            {
              targetObjectNameSingular: 'person',
              targetRecordId: NEW_TARGET_RECORD_ID,
            },
          ],
        ],
      ]),
    );

    await upsertEvent({
      service,
      action: 'updated',
      event: buildEvent({
        after: {
          id: SOURCE_RECORD_ID,
          name: 'Quarterly report.pdf',
          updatedAt: EVENT_DATE,
        },
        diff: { name: { before: 'Old.pdf', after: 'Quarterly report.pdf' } },
      }),
    });

    expect(upsertTimelineActivities).toHaveBeenCalledTimes(1);
    expect(upsertTimelineActivities).toHaveBeenCalledWith(
      expect.objectContaining({
        objectSingularName: 'person',
        workspaceId: WORKSPACE_ID,
        payloads: expect.arrayContaining([
          expect.objectContaining({
            recordId: OLD_TARGET_RECORD_ID,
            linkedRecordId: SOURCE_RECORD_ID,
          }),
          expect.objectContaining({
            recordId: NEW_TARGET_RECORD_ID,
            linkedRecordId: SOURCE_RECORD_ID,
          }),
        ]),
      }),
    );
  });

  it('emits unlinked and linked activities when a direct relation is repointed', async () => {
    const targetShape = {
      kind: 'DIRECT_RELATION' as const,
      targetJoinColumns: [
        {
          joinColumnName: 'targetPersonId',
          targetObjectNameSingular: 'person',
        },
      ],
    };
    const unlinkedRule = buildRule({ action: 'unlinked', targetShape });
    const linkedRule = buildRule({ action: 'linked', targetShape });
    const { service, upsertTimelineActivities } = buildService({
      sourceRules: [unlinkedRule, linkedRule],
    });

    await upsertEvent({
      service,
      action: 'updated',
      event: buildEvent({
        before: {
          id: SOURCE_RECORD_ID,
          targetPersonId: OLD_TARGET_RECORD_ID,
          updatedAt: EVENT_DATE,
        },
        after: {
          id: SOURCE_RECORD_ID,
          targetPersonId: NEW_TARGET_RECORD_ID,
          updatedAt: EVENT_DATE,
        },
        diff: {
          targetPersonId: {
            before: OLD_TARGET_RECORD_ID,
            after: NEW_TARGET_RECORD_ID,
          },
        },
        updatedFields: ['targetPersonId'],
      }),
    });

    expect(upsertTimelineActivities).toHaveBeenCalledTimes(1);
    expect(upsertTimelineActivities).toHaveBeenCalledWith(
      expect.objectContaining({
        objectSingularName: 'person',
        payloads: [
          expect.objectContaining({
            timelineActivityTypeId: unlinkedRule.timelineActivityType?.id,
            recordId: OLD_TARGET_RECORD_ID,
          }),
          expect.objectContaining({
            timelineActivityTypeId: linkedRule.timelineActivityType?.id,
            recordId: NEW_TARGET_RECORD_ID,
          }),
        ],
      }),
    );
  });

  it.each([
    { eventAction: 'created' as const, ruleAction: 'linked' as const },
    { eventAction: 'deleted' as const, ruleAction: 'unlinked' as const },
  ])(
    'turns a $eventAction junction row into a $ruleAction activity',
    async ({ eventAction, ruleAction }) => {
      const rule = buildRule({
        action: ruleAction,
        targetShape: {
          kind: 'JUNCTION',
          junctionObjectMetadataId: 'junction-object-id',
          junctionObjectNameSingular: 'attachmentTarget',
          junctionSourceJoinColumnName: 'attachmentId',
          targetJoinColumns: [
            {
              joinColumnName: 'targetPersonId',
              targetObjectNameSingular: 'person',
            },
          ],
        },
      });
      const { service, upsertTimelineActivities, findSourceRecordsByRecordId } =
        buildService({ junctionRules: [rule] });
      const junctionRecord = {
        id: 'junction-record-id',
        attachmentId: SOURCE_RECORD_ID,
        targetPersonId: NEW_TARGET_RECORD_ID,
        updatedAt: EVENT_DATE,
      };

      await upsertEvent({
        service,
        action: eventAction,
        event: buildEvent({
          before: junctionRecord,
          after: junctionRecord,
        }),
      });

      expect(findSourceRecordsByRecordId).toHaveBeenCalledWith({
        rule,
        recordIds: [SOURCE_RECORD_ID],
        workspaceId: WORKSPACE_ID,
      });
      expect(findSourceRecordsByRecordId).toHaveBeenCalledTimes(1);
      expect(upsertTimelineActivities).toHaveBeenCalledTimes(1);
      expect(upsertTimelineActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          objectSingularName: 'person',
          payloads: [
            expect.objectContaining({
              timelineActivityTypeId: rule.timelineActivityType?.id,
              recordId: NEW_TARGET_RECORD_ID,
              linkedRecordId: SOURCE_RECORD_ID,
              properties: {},
            }),
          ],
        }),
      );
    },
  );

  it('emits unlinked and linked activities when a junction is repointed', async () => {
    const targetShape = {
      kind: 'JUNCTION' as const,
      junctionObjectMetadataId: 'junction-object-id',
      junctionObjectNameSingular: 'attachmentTarget',
      junctionSourceJoinColumnName: 'attachmentId',
      targetJoinColumns: [
        {
          joinColumnName: 'targetPersonId',
          targetObjectNameSingular: 'person',
        },
      ],
    };
    const unlinkedRule = buildRule({ action: 'unlinked', targetShape });
    const linkedRule = buildRule({ action: 'linked', targetShape });
    const { service, upsertTimelineActivities } = buildService({
      junctionRules: [unlinkedRule, linkedRule],
    });

    await upsertEvent({
      service,
      action: 'updated',
      event: buildEvent({
        before: {
          id: 'junction-record-id',
          attachmentId: SOURCE_RECORD_ID,
          targetPersonId: OLD_TARGET_RECORD_ID,
          updatedAt: EVENT_DATE,
        },
        after: {
          id: 'junction-record-id',
          attachmentId: SOURCE_RECORD_ID,
          targetPersonId: NEW_TARGET_RECORD_ID,
          updatedAt: EVENT_DATE,
        },
        diff: {
          targetPersonId: {
            before: OLD_TARGET_RECORD_ID,
            after: NEW_TARGET_RECORD_ID,
          },
        },
        updatedFields: ['targetPersonId'],
      }),
    });

    expect(upsertTimelineActivities).toHaveBeenCalledWith(
      expect.objectContaining({
        objectSingularName: 'person',
        payloads: [
          expect.objectContaining({
            timelineActivityTypeId: unlinkedRule.timelineActivityType?.id,
            recordId: OLD_TARGET_RECORD_ID,
            linkedRecordId: SOURCE_RECORD_ID,
          }),
          expect.objectContaining({
            timelineActivityTypeId: linkedRule.timelineActivityType?.id,
            recordId: NEW_TARGET_RECORD_ID,
            linkedRecordId: SOURCE_RECORD_ID,
          }),
        ],
      }),
    );
  });

  it('does not treat an unrelated junction update as a new link', async () => {
    const rule = buildRule({
      action: 'linked',
      targetShape: {
        kind: 'JUNCTION',
        junctionObjectMetadataId: 'junction-object-id',
        junctionObjectNameSingular: 'attachmentTarget',
        junctionSourceJoinColumnName: 'attachmentId',
        targetJoinColumns: [
          {
            joinColumnName: 'targetPersonId',
            targetObjectNameSingular: 'person',
          },
        ],
      },
    });
    const { service, upsertTimelineActivities } = buildService({
      junctionRules: [rule],
    });

    await upsertEvent({
      service,
      action: 'updated',
      event: buildEvent({
        after: {
          attachmentId: SOURCE_RECORD_ID,
          targetPersonId: NEW_TARGET_RECORD_ID,
          updatedAt: EVENT_DATE,
        },
        diff: { position: { before: 1, after: 2 } },
        updatedFields: ['position'],
      }),
    });

    expect(upsertTimelineActivities).not.toHaveBeenCalled();
  });
});
