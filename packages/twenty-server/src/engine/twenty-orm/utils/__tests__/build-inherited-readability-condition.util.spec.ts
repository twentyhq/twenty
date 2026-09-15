import { RecordShareAccessLevel } from 'twenty-shared/types';

import {
  buildInheritedReadabilityCondition,
  type InheritedReadabilityParentCondition,
} from 'src/engine/twenty-orm/utils/build-inherited-readability-condition.util';

const RECORD_SHARE_TABLE_EXPRESSION = '"workspace_abc"."recordShare"';
const ATTACHMENT_OBJECT_METADATA_ID = 'attachment-object-metadata-id';
const NOTE_OBJECT_METADATA_ID = 'note-object-metadata-id';
const PRINCIPAL_IDS = ['principal-1', 'principal-2'];
const ACCESS_LEVELS = [RecordShareAccessLevel.READ];

const OWN_RECORD_SHARE_EXISTS =
  '(EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "attachment_recordShare" WHERE "attachment_recordShare"."recordId" = "attachment"."id"';

const countOccurrences = (haystack: string, needle: string): number =>
  haystack.split(needle).length - 1;

const build = (parents: InheritedReadabilityParentCondition[]) =>
  buildInheritedReadabilityCondition({
    tableAlias: 'attachment',
    objectMetadataId: ATTACHMENT_OBJECT_METADATA_ID,
    parents,
    recordShareTableExpression: RECORD_SHARE_TABLE_EXPRESSION,
    principalIds: PRINCIPAL_IDS,
    accessLevels: ACCESS_LEVELS,
  });

const findParameterValues = (
  parameters: Record<string, unknown>,
  prefix: string,
): unknown[] =>
  Object.entries(parameters)
    .filter(([name]) => name.startsWith(prefix))
    .map(([, value]) => value);

describe('buildInheritedReadabilityCondition', () => {
  it('should accept a share row on the record itself or an OPEN parent present', () => {
    const condition = build([
      {
        kind: 'column',
        joinColumnName: 'targetPersonId',
        gate: { kind: 'open' },
      },
      {
        kind: 'column',
        joinColumnName: 'targetCompanyId',
        gate: { kind: 'open' },
      },
    ]);

    expect(condition).toBeDefined();

    const { sql, parameters } = condition!;

    expect(sql.startsWith(OWN_RECORD_SHARE_EXISTS)).toBe(true);
    expect(sql).toContain(
      ' OR "attachment"."targetPersonId" IS NOT NULL OR "attachment"."targetCompanyId" IS NOT NULL)',
    );
    expect(countOccurrences(sql, 'EXISTS')).toBe(1);
    expect(
      findParameterValues(parameters, 'recordShareObjectMetadataId_'),
    ).toEqual([ATTACHMENT_OBJECT_METADATA_ID]);
  });

  it('should gate a PRIVATE parent on one record share EXISTS keyed by the parent column', () => {
    const condition = build([
      {
        kind: 'column',
        joinColumnName: 'targetPersonId',
        gate: { kind: 'open' },
      },
      {
        kind: 'column',
        joinColumnName: 'targetNoteId',
        gate: { kind: 'private', objectMetadataId: NOTE_OBJECT_METADATA_ID },
      },
    ]);

    expect(condition).toBeDefined();

    const { sql, parameters } = condition!;

    expect(sql).toContain(
      ' OR "attachment"."targetPersonId" IS NOT NULL OR ("attachment"."targetNoteId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "attachment_recordShare" WHERE "attachment_recordShare"."recordId" = "attachment"."targetNoteId"',
    );
    expect(countOccurrences(sql, 'EXISTS')).toBe(2);
    expect(sql).not.toContain('"attachment"."targetPersonId" IS NOT NULL AND');
    expect(
      findParameterValues(parameters, 'recordShareObjectMetadataId_').sort(),
    ).toEqual([ATTACHMENT_OBJECT_METADATA_ID, NOTE_OBJECT_METADATA_ID].sort());
  });

  it('should only keep rows shared directly when every parent is denied', () => {
    const condition = build([
      {
        kind: 'column',
        joinColumnName: 'targetNoteId',
        gate: { kind: 'denied' },
      },
    ]);

    expect(condition).toBeDefined();

    const { sql } = condition!;

    expect(sql.startsWith(OWN_RECORD_SHARE_EXISTS)).toBe(true);
    expect(sql).not.toContain('IS NOT NULL');
    expect(countOccurrences(sql, 'EXISTS')).toBe(1);
  });

  it('should correlate an INHERITED parent through its own condition', () => {
    const condition = build([
      {
        kind: 'column',
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

    expect(condition).toBeDefined();

    const { sql, parameters } = condition!;

    expect(sql).toContain(
      ' OR ("attachment"."targetNoteId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace_abc"."note" AS "attachment_targetNoteId" WHERE "attachment_targetNoteId"."id" = "attachment"."targetNoteId" AND "attachment_targetNoteId"."companyId" IS NOT NULL)))',
    );
    expect(parameters.nested).toBe('value');
  });

  it('should accept any live child row of an OPEN child object', () => {
    const condition = build([
      {
        kind: 'children',
        childTableAlias: 'attachment_noteTarget',
        childTableExpression: '"workspace_abc"."noteTarget"',
        childJoinColumnName: 'noteId',
        gate: { kind: 'open' },
      },
    ]);

    expect(condition).toBeDefined();

    expect(condition!.sql).toContain(
      ' OR EXISTS (SELECT 1 FROM "workspace_abc"."noteTarget" AS "attachment_noteTarget" WHERE "attachment_noteTarget"."noteId" = "attachment"."id" AND "attachment_noteTarget"."deletedAt" IS NULL))',
    );
  });

  it('should require a readable child row of a gated child object and skip a denied one', () => {
    const condition = build([
      {
        kind: 'children',
        childTableAlias: 'attachment_noteTarget',
        childTableExpression: '"workspace_abc"."noteTarget"',
        childJoinColumnName: 'noteId',
        gate: {
          kind: 'gated',
          condition: {
            sql: '"attachment_noteTarget"."targetPersonId" IS NOT NULL',
            parameters: { nested: 'value' },
          },
        },
      },
      {
        kind: 'children',
        childTableAlias: 'attachment_secret',
        childTableExpression: '"workspace_abc"."secret"',
        childJoinColumnName: 'attachmentId',
        gate: { kind: 'denied' },
      },
    ]);

    expect(condition).toBeDefined();

    const { sql, parameters } = condition!;

    expect(sql).toContain(
      ' OR EXISTS (SELECT 1 FROM "workspace_abc"."noteTarget" AS "attachment_noteTarget" WHERE "attachment_noteTarget"."noteId" = "attachment"."id" AND "attachment_noteTarget"."deletedAt" IS NULL AND "attachment_noteTarget"."targetPersonId" IS NOT NULL))',
    );
    expect(sql).not.toContain('secret');
    expect(parameters.nested).toBe('value');
  });
});
