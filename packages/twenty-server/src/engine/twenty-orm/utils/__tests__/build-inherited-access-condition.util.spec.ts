import {
  ObjectAccessInheritanceMatch,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import {
  buildInheritedAccessCondition,
  type InheritedAccessBranchGate,
} from 'src/engine/twenty-orm/utils/build-inherited-access-condition.util';

const RECORD_SHARE_TABLE = '"workspace_x"."recordShare"';
const ACCESS_LEVELS = [
  RecordShareAccessLevel.READ,
  RecordShareAccessLevel.READ_WRITE,
  RecordShareAccessLevel.FULL,
];

const build = (
  branches: InheritedAccessBranchGate[],
  match = ObjectAccessInheritanceMatch.ANY,
) =>
  buildInheritedAccessCondition({
    tableAlias: 'attachment',
    branches,
    match,
    recordShareTableExpression: RECORD_SHARE_TABLE,
    principalIds: ['principal-id'],
    accessLevels: ACCESS_LEVELS,
  });

const openBranch = (joinColumnName: string): InheritedAccessBranchGate => ({
  isMorph: false,
  columns: [{ joinColumnName, gate: { kind: 'open' } }],
});

const privateBranch = (
  joinColumnName: string,
  objectMetadataId: string,
): InheritedAccessBranchGate => ({
  isMorph: false,
  columns: [
    { joinColumnName, gate: { kind: 'recordShare', objectMetadataId } },
  ],
});

describe('buildInheritedAccessCondition', () => {
  it('requires a populated parent even when its object is OPEN', () => {
    expect(build([openBranch('noteId')]).sql).toBe(
      '(("attachment"."noteId" IS NOT NULL))',
    );
  });

  it('denies a branch whose every parent gate is denied', () => {
    expect(
      build([
        {
          isMorph: false,
          columns: [{ joinColumnName: 'noteId', gate: { kind: 'denied' } }],
        },
      ]).sql,
    ).toBe('((1=0))');
  });

  it('ORs the branches on ANY and ANDs them on ALL', () => {
    const branches = [openBranch('sourceId'), openBranch('targetId')];

    expect(build(branches, ObjectAccessInheritanceMatch.ANY).sql).toBe(
      '(("attachment"."sourceId" IS NOT NULL) OR ("attachment"."targetId" IS NOT NULL))',
    );
    expect(build(branches, ObjectAccessInheritanceMatch.ALL).sql).toBe(
      '(("attachment"."sourceId" IS NOT NULL) AND ("attachment"."targetId" IS NOT NULL))',
    );
  });

  it('requires exactly one concrete parent inside a morph branch', () => {
    const { sql } = build([
      {
        isMorph: true,
        columns: [
          { joinColumnName: 'targetNoteId', gate: { kind: 'open' } },
          { joinColumnName: 'targetPersonId', gate: { kind: 'denied' } },
        ],
      },
    ]);

    expect(sql).toBe(
      '((((CASE WHEN "attachment"."targetNoteId" IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN "attachment"."targetPersonId" IS NOT NULL THEN 1 ELSE 0 END) = 1) AND ("attachment"."targetNoteId" IS NOT NULL)))',
    );
  });

  it('leaves the empty alternatives of a morph out of an ALL requirement', () => {
    const { sql } = build(
      [
        {
          isMorph: true,
          columns: [
            { joinColumnName: 'sourceNoteId', gate: { kind: 'open' } },
            { joinColumnName: 'sourcePersonId', gate: { kind: 'open' } },
          ],
        },
        openBranch('targetId'),
      ],
      ObjectAccessInheritanceMatch.ALL,
    );

    expect(sql).toContain(') AND ("attachment"."targetId" IS NOT NULL))');
    expect(sql).toContain('"attachment"."sourceNoteId" IS NOT NULL');
    expect(sql).toContain('"attachment"."sourcePersonId" IS NOT NULL');
  });

  it('checks the share rows of a PRIVATE parent against its own record id', () => {
    const { sql, parameters } = build([
      privateBranch('noteId', 'note-object-metadata-id'),
    ]);

    expect(sql).toContain('"attachment"."noteId" IS NOT NULL AND EXISTS');
    expect(sql).toContain('"recordId" = "attachment"."noteId"');
    expect(Object.values(parameters)).toContainEqual('note-object-metadata-id');
    expect(Object.values(parameters)).toContainEqual(['principal-id']);
  });

  it('nests the conditions of a parent that is itself gated', () => {
    const { sql, parameters } = build([
      {
        isMorph: false,
        columns: [
          {
            joinColumnName: 'noteId',
            gate: {
              kind: 'parentRow',
              alias: 'parent_alias',
              tableExpression: '"workspace_x"."note"',
              conditions: [
                {
                  sql: '"parent_alias"."ownerId" = :ownerId',
                  parameters: { ownerId: 'owner-id' },
                },
              ],
            },
          },
        ],
      },
    ]);

    expect(sql).toBe(
      '(("attachment"."noteId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace_x"."note" AS "parent_alias" WHERE "parent_alias"."id" = "attachment"."noteId" AND "parent_alias"."ownerId" = :ownerId)))',
    );
    expect(parameters).toEqual({ ownerId: 'owner-id' });
  });

  it('denies an object whose policy resolved to no branch', () => {
    expect(build([]).sql).toBe('(1=0)');
  });
});
