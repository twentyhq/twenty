import { RecordShareAccessLevel } from 'twenty-shared/types';

import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import {
  buildLinkedRecordGuardCondition,
  type LinkedObjectGate,
} from 'src/engine/twenty-orm/utils/build-linked-record-guard-condition.util';

const RECORD_SHARE_TABLE_EXPRESSION = '"workspace_abc"."recordShare"';
const PRINCIPAL_IDS = ['principal-1', 'principal-2'];
const ACCESS_LEVELS = [RecordShareAccessLevel.READ];
const NOTE_OBJECT_METADATA_ID = 'note-object-metadata-id';
const ATTACHMENT_OBJECT_METADATA_ID = 'attachment-object-metadata-id';
const RECORD_SHARE_OBJECT_METADATA_ID = 'record-share-object-metadata-id';

const build = (linkedObjects: LinkedObjectGate[]) =>
  buildLinkedRecordGuardCondition({
    tableAlias: 'timelineActivity',
    recordShareTableExpression: RECORD_SHARE_TABLE_EXPRESSION,
    principalIds: PRINCIPAL_IDS,
    accessLevels: ACCESS_LEVELS,
    linkedObjects,
  });

describe('buildLinkedRecordGuardCondition', () => {
  it('should return nothing when every linked object is open', () => {
    expect(
      build([
        { objectMetadataId: 'person', gate: { kind: 'open' } },
        { objectMetadataId: 'callRecording', gate: { kind: 'open' } },
      ]),
    ).toBeUndefined();
  });

  it('should let through null and open linked objects and gate a private one on a share row keyed on the linked columns', () => {
    const condition = build([
      { objectMetadataId: 'person', gate: { kind: 'open' } },
      {
        objectMetadataId: NOTE_OBJECT_METADATA_ID,
        gate: { kind: 'private', objectMetadataId: NOTE_OBJECT_METADATA_ID },
      },
    ]);

    expect(condition).toBeDefined();

    expect(
      compileNamedParameters(condition!.sql, condition!.parameters),
    ).toEqual({
      text: '("timelineActivity"."linkedObjectMetadataId" IS NULL OR "timelineActivity"."linkedObjectMetadataId" NOT IN ($1) OR ("timelineActivity"."linkedObjectMetadataId" IN ($2) AND EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "timelineActivity_recordShare" WHERE "timelineActivity_recordShare"."recordId" = "timelineActivity"."linkedRecordId" AND "timelineActivity_recordShare"."objectMetadataId" = "timelineActivity"."linkedObjectMetadataId" AND "timelineActivity_recordShare"."objectMetadataId" IN ($3) AND "timelineActivity_recordShare"."principalId" = ANY($4) AND "timelineActivity_recordShare"."accessLevel" IN ($5) AND "timelineActivity_recordShare"."deletedAt" IS NULL)))',
      values: [
        NOTE_OBJECT_METADATA_ID,
        NOTE_OBJECT_METADATA_ID,
        NOTE_OBJECT_METADATA_ID,
        PRINCIPAL_IDS,
        RecordShareAccessLevel.READ,
      ],
    });
  });

  it('should deny denied linked objects with the NOT IN clause alone', () => {
    const condition = build([
      {
        objectMetadataId: RECORD_SHARE_OBJECT_METADATA_ID,
        gate: { kind: 'denied' },
      },
      { objectMetadataId: 'appObject', gate: { kind: 'denied' } },
    ]);

    expect(condition).toBeDefined();
    expect(
      compileNamedParameters(condition!.sql, condition!.parameters),
    ).toEqual({
      text: '("timelineActivity"."linkedObjectMetadataId" IS NULL OR "timelineActivity"."linkedObjectMetadataId" NOT IN ($1, $2))',
      values: [RECORD_SHARE_OBJECT_METADATA_ID, 'appObject'],
    });
  });

  it('should gate an inherited linked object on the readability of the linked record itself', () => {
    const condition = build([
      {
        objectMetadataId: ATTACHMENT_OBJECT_METADATA_ID,
        gate: {
          kind: 'inherited',
          parentTableAlias: 'timelineActivity_linkedRecordId',
          parentTableExpression: '"workspace_abc"."attachment"',
          parentCondition: {
            sql: '("timelineActivity_linkedRecordId"."targetNoteId" IS NOT NULL AND :sharedNote)',
            parameters: { sharedNote: true },
          },
        },
      },
    ]);

    expect(condition).toBeDefined();
    expect(
      compileNamedParameters(condition!.sql, condition!.parameters),
    ).toEqual({
      text: '("timelineActivity"."linkedObjectMetadataId" IS NULL OR "timelineActivity"."linkedObjectMetadataId" NOT IN ($1) OR ("timelineActivity"."linkedObjectMetadataId" = $2 AND (("timelineActivity"."linkedRecordId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace_abc"."attachment" AS "timelineActivity_linkedRecordId" WHERE "timelineActivity_linkedRecordId"."id" = "timelineActivity"."linkedRecordId" AND ("timelineActivity_linkedRecordId"."targetNoteId" IS NOT NULL AND $3))))))',
      values: [
        ATTACHMENT_OBJECT_METADATA_ID,
        ATTACHMENT_OBJECT_METADATA_ID,
        true,
      ],
    });
  });

  it('should list denied, private and inherited objects together in the NOT IN clause', () => {
    const condition = build([
      {
        objectMetadataId: RECORD_SHARE_OBJECT_METADATA_ID,
        gate: { kind: 'denied' },
      },
      {
        objectMetadataId: NOTE_OBJECT_METADATA_ID,
        gate: { kind: 'private', objectMetadataId: NOTE_OBJECT_METADATA_ID },
      },
      {
        objectMetadataId: ATTACHMENT_OBJECT_METADATA_ID,
        gate: {
          kind: 'inherited',
          parentTableAlias: 'timelineActivity_linkedRecordId',
          parentTableExpression: '"workspace_abc"."attachment"',
          parentCondition: { sql: '(1=1)', parameters: {} },
        },
      },
    ]);

    expect(condition).toBeDefined();

    const { values } = compileNamedParameters(
      condition!.sql,
      condition!.parameters,
    );

    expect(values.slice(0, 3)).toEqual([
      RECORD_SHARE_OBJECT_METADATA_ID,
      NOTE_OBJECT_METADATA_ID,
      ATTACHMENT_OBJECT_METADATA_ID,
    ]);
  });
});
