import {
  MetadataReadability,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import {
  buildLinkedRecordGuardCondition,
  type LinkedObjectReadability,
} from 'src/engine/twenty-orm/utils/build-linked-record-guard-condition.util';

const RECORD_SHARE_TABLE_EXPRESSION = '"workspace_abc"."recordShare"';
const PRINCIPAL_IDS = ['principal-1', 'principal-2'];
const ACCESS_LEVELS = [RecordShareAccessLevel.READ];
const NOTE_OBJECT_METADATA_ID = 'note-object-metadata-id';
const RECORD_SHARE_OBJECT_METADATA_ID = 'record-share-object-metadata-id';

const linkedObject = (
  objectMetadataId: string,
  readability: MetadataReadability,
  isOwningApplication = false,
): LinkedObjectReadability => ({
  objectMetadataId,
  readability,
  isOwningApplication,
});

const build = (linkedObjects: LinkedObjectReadability[]) =>
  buildLinkedRecordGuardCondition({
    tableAlias: 'timelineActivity',
    recordShareTableExpression: RECORD_SHARE_TABLE_EXPRESSION,
    principalIds: PRINCIPAL_IDS,
    accessLevels: ACCESS_LEVELS,
    linkedObjects,
  });

describe('buildLinkedRecordGuardCondition', () => {
  it('should return nothing when every object is OPEN, INHERITED or owned by the caller', () => {
    expect(
      build([
        linkedObject('person', MetadataReadability.OPEN),
        linkedObject('noteTarget', MetadataReadability.INHERITED),
        linkedObject('callRecording', MetadataReadability.PRIVATE, true),
        linkedObject('appObject', MetadataReadability.APPLICATION, true),
      ]),
    ).toBeUndefined();
  });

  it('should let through null and OPEN linked objects and gate a PRIVATE one on a share row keyed on the linked columns', () => {
    const condition = build([
      linkedObject('person', MetadataReadability.OPEN),
      linkedObject(NOTE_OBJECT_METADATA_ID, MetadataReadability.PRIVATE),
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

  it('should deny SYSTEM and foreign APPLICATION linked objects with the NOT IN clause alone', () => {
    const condition = build([
      linkedObject(RECORD_SHARE_OBJECT_METADATA_ID, MetadataReadability.SYSTEM),
      linkedObject('appObject', MetadataReadability.APPLICATION),
    ]);

    expect(condition).toBeDefined();
    expect(
      compileNamedParameters(condition!.sql, condition!.parameters),
    ).toEqual({
      text: '("timelineActivity"."linkedObjectMetadataId" IS NULL OR "timelineActivity"."linkedObjectMetadataId" NOT IN ($1, $2))',
      values: [RECORD_SHARE_OBJECT_METADATA_ID, 'appObject'],
    });
  });

  it('should list denied and PRIVATE objects together in the NOT IN clause', () => {
    const condition = build([
      linkedObject(RECORD_SHARE_OBJECT_METADATA_ID, MetadataReadability.SYSTEM),
      linkedObject(NOTE_OBJECT_METADATA_ID, MetadataReadability.PRIVATE),
    ]);

    expect(condition).toBeDefined();

    const { values } = compileNamedParameters(
      condition!.sql,
      condition!.parameters,
    );

    expect(values.slice(0, 4)).toEqual([
      RECORD_SHARE_OBJECT_METADATA_ID,
      NOTE_OBJECT_METADATA_ID,
      NOTE_OBJECT_METADATA_ID,
      NOTE_OBJECT_METADATA_ID,
    ]);
  });
});
