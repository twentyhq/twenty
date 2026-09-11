import { RecordShareAccessLevel } from 'twenty-shared/types';

import {
  buildLinkedRecordGuardCondition,
  type LinkedRecordObjectGate,
} from 'src/engine/twenty-orm/utils/build-linked-record-guard-condition.util';

const build = (objectGates: LinkedRecordObjectGate[]) =>
  buildLinkedRecordGuardCondition({
    tableAlias: 'timelineActivity',
    linkedObjectMetadataIdColumnName: 'linkedObjectMetadataId',
    linkedRecordIdColumnName: 'linkedRecordId',
    objectGates,
    recordShareTableExpression: '"workspace_x"."recordShare"',
    principalIds: ['principal-id'],
    accessLevels: [RecordShareAccessLevel.READ],
  });

describe('buildLinkedRecordGuardCondition', () => {
  it('lets an activity without linked content through', () => {
    expect(
      build([{ objectMetadataId: 'note-id', gate: { kind: 'open' } }]).sql,
    ).toContain(
      '("timelineActivity"."linkedObjectMetadataId" IS NULL AND "timelineActivity"."linkedRecordId" IS NULL)',
    );
  });

  it('only allows the object ids it was explicitly given', () => {
    const { sql, parameters } = build([
      { objectMetadataId: 'note-id', gate: { kind: 'open' } },
      { objectMetadataId: 'secret-id', gate: { kind: 'denied' } },
    ]);

    expect(sql).toContain('"timelineActivity"."linkedObjectMetadataId" = ANY(');
    expect(Object.values(parameters)).toContainEqual(['note-id']);
    expect(Object.values(parameters)).not.toContainEqual(['secret-id']);
  });

  it('hides every activity when no linked object is readable', () => {
    expect(
      build([{ objectMetadataId: 'secret-id', gate: { kind: 'denied' } }]).sql,
    ).toBe(
      '(("timelineActivity"."linkedObjectMetadataId" IS NULL AND "timelineActivity"."linkedRecordId" IS NULL))',
    );
  });

  it('matches the share rows on the linked object and record columns', () => {
    const { sql } = build([
      {
        objectMetadataId: 'note-id',
        gate: { kind: 'recordShare', objectMetadataId: 'note-id' },
      },
    ]);

    expect(sql).toContain('"recordId" = "timelineActivity"."linkedRecordId"');
    expect(sql).toContain(
      '"objectMetadataId" = "timelineActivity"."linkedObjectMetadataId"',
    );
  });

  it('carries the parent condition of an inherited linked object', () => {
    const { sql, parameters } = build([
      {
        objectMetadataId: 'attachment-id',
        gate: {
          kind: 'parentRow',
          alias: 'linked_attachment',
          tableExpression: '"workspace_x"."attachment"',
          conditions: [
            {
              sql: '"linked_attachment"."noteId" IS NOT NULL',
              parameters: {},
            },
          ],
        },
      },
    ]);

    expect(sql).toContain(
      'EXISTS (SELECT 1 FROM "workspace_x"."attachment" AS "linked_attachment" WHERE "linked_attachment"."id" = "timelineActivity"."linkedRecordId" AND "linked_attachment"."noteId" IS NOT NULL)',
    );
    expect(Object.values(parameters)).toContainEqual('attachment-id');
  });
});
