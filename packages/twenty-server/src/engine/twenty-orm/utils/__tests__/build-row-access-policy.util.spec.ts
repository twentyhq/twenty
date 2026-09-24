import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';

import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type RowAccessPolicyEnvironment,
  type RowAccessPolicySubject,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { buildRowAccessPolicy } from 'src/engine/twenty-orm/utils/build-row-access-policy.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';

jest.mock(
  'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util',
);
jest.mock(
  'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util',
);

const APPLICATION_ID = 'application-id';
const NOTE_FILTER = { title: { eq: 'restricted' } };

const buildObject = ({
  id,
  readability,
}: {
  id: string;
  readability: MetadataReadability;
}): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id,
    nameSingular: id,
    namePlural: `${id}s`,
    universalIdentifier: `${id}-universal-identifier`,
    applicationId: APPLICATION_ID,
    isSystem: false,
    readability,
    readabilityParentFieldUniversalIdentifiers: null,
  } as Parameters<typeof getFlatObjectMetadataMock>[0]);

const attachment = buildObject({
  id: 'attachment',
  readability: MetadataReadability.INHERITED,
});
const note = buildObject({ id: 'note', readability: MetadataReadability.OPEN });
const person = buildObject({
  id: 'person',
  readability: MetadataReadability.PRIVATE,
});

const environment: RowAccessPolicyEnvironment = {
  flatFieldMetadataMaps: { byId: {} } as never,
  flatObjectMetadataMaps: { byId: {} } as never,
  recordShareTableExpression: '"workspace"."recordShare"',
  resolveTableExpression: (objectMetadataId) =>
    `"workspace"."${objectMetadataId}"`,
};

const readEverything: RowAccessPolicySubject = {
  isSystemContext: false,
  objectsPermissions: undefined,
  principalIds: ['member-1'],
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};

const build = (
  subject: RowAccessPolicySubject,
  flatObjectMetadata: FlatObjectMetadata,
) =>
  buildRowAccessPolicy({
    subject,
    environment,
    tableAlias: flatObjectMetadata.nameSingular,
    flatObjectMetadata,
    operationType: 'select',
    depth: 0,
  });

const gatedSql = (
  subject: RowAccessPolicySubject,
  flatObjectMetadata: FlatObjectMetadata,
): string => {
  const policy = build(subject, flatObjectMetadata);

  expect(policy.kind).toBe('gated');

  return policy.kind === 'gated' ? policy.condition.sql : '';
};

describe('buildRowAccessPolicy', () => {
  beforeEach(() => {
    (resolveInheritedReadabilityParents as jest.Mock).mockReturnValue([
      {
        kind: 'column',
        fieldMetadataId: 'target-note-field-id',
        joinColumnName: 'targetNoteId',
        parentFlatObjectMetadata: note,
      },
      {
        kind: 'column',
        fieldMetadataId: 'target-person-field-id',
        joinColumnName: 'targetPersonId',
        parentFlatObjectMetadata: person,
      },
    ]);
    (renderRowLevelPermissionFilterToSql as jest.Mock).mockImplementation(
      ({ tableAlias }: { tableAlias: string }) => ({
        sql: `"${tableAlias}"."title" = :restricted`,
        parameters: { restricted: 'restricted' },
      }),
    );
  });

  it.each(Object.values(MetadataReadability))(
    'allows trusted system reads and writes for %s metadata',
    (readability) => {
      for (const operationType of ['select', 'update', 'delete'] as const) {
        expect(
          buildRowAccessPolicy({
            subject: {
              ...readEverything,
              isSystemContext: true,
              principalIds: undefined,
            },
            environment,
            tableAlias: 'internal',
            flatObjectMetadata: {
              ...note,
              readability,
              writability: MetadataWritability.SYSTEM,
            },
            operationType,
            depth: 0,
          }),
        ).toEqual({ kind: 'open' });
      }
    },
  );

  it('keeps APPLICATION records restricted to their owning application', () => {
    const object = { ...note, readability: MetadataReadability.APPLICATION };
    expect(build(readEverything, object)).toEqual({ kind: 'denied' });
    expect(
      build({ ...readEverything, isOwningApplication: () => true }, object),
    ).toEqual({ kind: 'open' });
  });

  it('opens an OPEN object to a subject without predicate', () => {
    expect(build(readEverything, note)).toEqual({ kind: 'open' });
  });

  it('denies an object the subject has no permission on', () => {
    expect(build({ ...readEverything, objectsPermissions: {} }, note)).toEqual({
      kind: 'denied',
    });
  });

  it('gates an OPEN object on the role predicate alone', () => {
    const sql = gatedSql(
      {
        ...readEverything,
        resolveRowLevelPermissionRecordFilter: () => NOTE_FILTER,
      },
      note,
    );

    expect(sql).toBe('("note"."title" = :restricted)');
  });

  it('gates a PRIVATE object on its share rows and leaves it open without principals', () => {
    expect(gatedSql(readEverything, person)).toContain(
      '"person_recordShare"."recordId" = "person"."id"',
    );
    expect(
      build({ ...readEverything, principalIds: undefined }, person),
    ).toEqual({ kind: 'open' });
  });

  it('follows an INHERITED object to its parents under the parents policies', () => {
    const sql = gatedSql(
      {
        ...readEverything,
        resolveRowLevelPermissionRecordFilter: (objectMetadata) =>
          objectMetadata.id === note.id ? NOTE_FILTER : null,
      },
      attachment,
    );

    expect(sql).toContain(
      '"attachment"."targetNoteId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace"."note" AS "attachment_targetNoteId" WHERE "attachment_targetNoteId"."id" = "attachment"."targetNoteId" AND ("attachment_targetNoteId"."title" = :restricted))',
    );
    expect(sql).toContain(
      '"attachment"."targetPersonId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace"."person" AS "attachment_targetPersonId" WHERE "attachment_targetPersonId"."id" = "attachment"."targetPersonId" AND (EXISTS (SELECT 1 FROM "workspace"."recordShare" AS "attachment_targetPersonId_recordShare"',
    );
  });

  it('drops a parent the subject may not read and keeps the others', () => {
    const sql = gatedSql(
      {
        ...readEverything,
        objectsPermissions: {
          [attachment.id]: { canReadObjectRecords: true },
          [note.id]: { canReadObjectRecords: true },
          [person.id]: { canReadObjectRecords: false },
        } as never,
      },
      attachment,
    );

    expect(sql).toContain('"attachment"."targetNoteId" IS NOT NULL');
    expect(sql).not.toContain('targetPersonId');
  });

  it('keeps an INHERITED object open for its owning application', () => {
    expect(
      build({ ...readEverything, isOwningApplication: () => true }, attachment),
    ).toEqual({ kind: 'open' });
  });
  it.each([MetadataWritability.SYSTEM, MetadataWritability.APPLICATION])(
    'does not inherit write access through a %s parent',
    (writability) => {
      jest.mocked(resolveInheritedReadabilityParents).mockReturnValue([
        {
          kind: 'column',
          fieldMetadataId: 'target-note-field-id',
          joinColumnName: 'targetNoteId',
          parentFlatObjectMetadata: {
            ...note,
            writability,
          },
        },
      ]);
      const policy = buildRowAccessPolicy({
        subject: readEverything,
        environment,
        tableAlias: 'attachment',
        flatObjectMetadata: attachment,
        operationType: 'update',
        depth: 0,
      });
      expect(policy.kind).toBe('gated');
      if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
      expect(policy.condition.sql).not.toContain('targetNoteId');
      expect(policy.condition.sql).toContain('recordShare');
    },
  );

  it('keeps private records gated regardless of the sharing UI flag', () => {
    const policy = buildRowAccessPolicy({
      subject: readEverything,
      environment,
      tableAlias: 'person',
      flatObjectMetadata: person,
      operationType: 'select',
      depth: 0,
    });
    expect(policy.kind).toBe('gated');
    if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
    expect(policy.condition.sql).toContain('recordShare');
    expect(policy.condition.sql).not.toContain('rowCause');
  });
});
