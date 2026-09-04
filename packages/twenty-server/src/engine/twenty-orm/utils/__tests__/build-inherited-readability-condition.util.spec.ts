import { RecordShareAccessLevel } from 'twenty-shared/types';

import {
  buildInheritedReadabilityCondition,
  type InheritedReadabilityParentCondition,
} from 'src/engine/twenty-orm/utils/build-inherited-readability-condition.util';

const RECORD_SHARE_TABLE_EXPRESSION = '"workspace_abc"."recordShare"';
const NOTE_OBJECT_METADATA_ID = 'note-object-metadata-id';
const PRINCIPAL_IDS = ['principal-1', 'principal-2'];
const ACCESS_LEVELS = [RecordShareAccessLevel.READ];

const countOccurrences = (haystack: string, needle: string): number =>
  haystack.split(needle).length - 1;

const build = (parents: InheritedReadabilityParentCondition[]) =>
  buildInheritedReadabilityCondition({
    tableAlias: 'attachment',
    parents,
    recordShareTableExpression: RECORD_SHARE_TABLE_EXPRESSION,
    principalIds: PRINCIPAL_IDS,
    accessLevels: ACCESS_LEVELS,
  });

describe('buildInheritedReadabilityCondition', () => {
  it('should return nothing when every parent is OPEN', () => {
    expect(
      build([
        { joinColumnName: 'targetPersonId', gate: { kind: 'open' } },
        { joinColumnName: 'targetCompanyId', gate: { kind: 'open' } },
      ]),
    ).toBeUndefined();
  });

  it('should gate an OPEN parent on presence and a PRIVATE parent on one record share EXISTS', () => {
    const condition = build([
      { joinColumnName: 'targetPersonId', gate: { kind: 'open' } },
      {
        joinColumnName: 'targetNoteId',
        gate: { kind: 'private', objectMetadataId: NOTE_OBJECT_METADATA_ID },
      },
    ]);

    expect(condition).toBeDefined();

    const { sql, parameters } = condition!;
    const [objectMetadataIdParameterName] = Object.keys(parameters).filter(
      (name) => name.startsWith('recordShareObjectMetadataId_'),
    );

    expect(sql).toContain(
      '(("attachment"."targetPersonId" IS NULL AND "attachment"."targetNoteId" IS NULL) OR "attachment"."targetPersonId" IS NOT NULL OR ("attachment"."targetNoteId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "attachment_recordShare" WHERE "attachment_recordShare"."recordId" = "attachment"."targetNoteId"',
    );
    expect(countOccurrences(sql, 'EXISTS')).toBe(1);
    expect(sql).not.toContain('"attachment"."targetPersonId" IS NOT NULL AND');
    expect(parameters[objectMetadataIdParameterName]).toBe(
      NOTE_OBJECT_METADATA_ID,
    );
  });

  it('should only let rows without any parent through when every parent is denied', () => {
    const condition = build([
      { joinColumnName: 'targetNoteId', gate: { kind: 'denied' } },
    ]);

    expect(condition).toEqual({
      sql: '(("attachment"."targetNoteId" IS NULL))',
      parameters: {},
    });
  });

  it('should correlate an INHERITED parent through its own condition', () => {
    const condition = build([
      {
        joinColumnName: 'targetNoteId',
        gate: {
          kind: 'inherited',
          parentTableAlias: 'attachment_targetNoteId',
          parentTableExpression: '"workspace_abc"."note"',
          parentCondition: {
            sql: '"attachment_targetNoteId"."companyId" IS NOT NULL',
            parameters: { nested: 'value' },
          },
        },
      },
    ]);

    expect(condition).toEqual({
      sql: '(("attachment"."targetNoteId" IS NULL) OR ("attachment"."targetNoteId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace_abc"."note" AS "attachment_targetNoteId" WHERE "attachment_targetNoteId"."id" = "attachment"."targetNoteId" AND "attachment_targetNoteId"."companyId" IS NOT NULL)))',
      parameters: { nested: 'value' },
    });
  });
});
