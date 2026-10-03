import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  MetadataReadability,
  MetadataWritability,
  ObjectSharingReach,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type RowAccessCompilationEnvironment,
  type RowAccessPolicyEnvironment,
  type RowAccessPolicySubject,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { buildRowAccessPolicy } from 'src/engine/twenty-orm/utils/build-row-access-policy.util';
import { compileRowAccessPolicy } from 'src/engine/twenty-orm/utils/compile-row-access-policy.util';
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

const environment: RowAccessPolicyEnvironment &
  RowAccessCompilationEnvironment = {
  flatFieldMetadataMaps: { byId: {} } as never,
  flatObjectMetadataMaps: { byId: {} } as never,
  recordShareTableExpression: '"workspace"."recordShare"',
  resolveTableExpression: (objectMetadataId) =>
    `"workspace"."${objectMetadataId}"`,
  isRecordSharingEnabled: false,
};

const buildCompiledRowAccessPolicy = (
  args: Parameters<typeof buildRowAccessPolicy>[0] & {
    environment: typeof environment;
  },
) =>
  compileRowAccessPolicy({
    policy: buildRowAccessPolicy(args),
    environment: args.environment,
  });

const readEverything: RowAccessPolicySubject = {
  isSystemContext: false,
  objectsPermissions: undefined,
  principalIds: ['member-1'],
  canAccessAllRecords: false,
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};

const build = (
  subject: RowAccessPolicySubject,
  flatObjectMetadata: FlatObjectMetadata,
) =>
  buildCompiledRowAccessPolicy({
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
          buildCompiledRowAccessPolicy({
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

  it('gates an OPEN object on its restrictions once record sharing is enabled', () => {
    const company = buildObject({
      id: 'company',
      readability: MetadataReadability.OPEN,
    });
    const policy = buildCompiledRowAccessPolicy({
      subject: readEverything,
      environment: { ...environment, isRecordSharingEnabled: true },
      tableAlias: 'company',
      flatObjectMetadata: company,
      operationType: 'select',
      depth: 0,
    });

    expect(policy.kind).toBe('gated');
    if (policy.kind !== 'gated') throw new Error('Expected an exception gate');
    expect(policy.condition.sql).toMatch(
      /^\(NOT EXISTS \(SELECT 1 FROM "workspace"."recordShare" AS "recordShareRestriction_[0-9a-f]{10}"/,
    );
  });

  it('lifts the restrictions of an OPEN object for a subject with access to all records', () => {
    expect(
      buildCompiledRowAccessPolicy({
        subject: { ...readEverything, canAccessAllRecords: true },
        environment: { ...environment, isRecordSharingEnabled: true },
        tableAlias: 'note',
        flatObjectMetadata: note,
        operationType: 'select',
        depth: 0,
      }),
    ).toEqual({ kind: 'open' });
  });

  it('keeps PRIVATE records gated for a subject with access to all records', () => {
    expect(
      gatedSql({ ...readEverything, canAccessAllRecords: true }, person),
    ).toContain('recordShare');
  });

  it('keeps an OPEN system object open when record sharing is enabled', () => {
    expect(
      buildCompiledRowAccessPolicy({
        subject: readEverything,
        environment: { ...environment, isRecordSharingEnabled: true },
        tableAlias: 'note',
        flatObjectMetadata: { ...note, isSystem: true },
        operationType: 'select',
        depth: 0,
      }),
    ).toEqual({ kind: 'open' });
  });

  it('leaves an OPEN object open to inserts when record sharing is enabled', () => {
    expect(
      buildCompiledRowAccessPolicy({
        subject: readEverything,
        environment: { ...environment, isRecordSharingEnabled: true },
        tableAlias: 'note',
        flatObjectMetadata: note,
        operationType: 'insert',
        depth: 0,
      }),
    ).toEqual({ kind: 'open' });
  });

  describe('with a record shared beyond the role', () => {
    const sharingEnvironment = { ...environment, isRecordSharingEnabled: true };
    const company = buildObject({
      id: 'company',
      readability: MetadataReadability.OPEN,
    });
    const buildForCompany = (
      subject: RowAccessPolicySubject,
      operationType: 'select' | 'update' | 'delete' = 'select',
    ) =>
      buildCompiledRowAccessPolicy({
        subject,
        environment: sharingEnvironment,
        tableAlias: 'company',
        flatObjectMetadata: company,
        operationType,
        depth: 0,
      });
    const withoutObjectPermission: RowAccessPolicySubject = {
      ...readEverything,
      principalIds: ['role-2', 'member-1', 'role-1'],
      objectsPermissions: {},
    };

    it('narrows a subject without object permission to the records named for them', () => {
      const policy = buildForCompany(withoutObjectPermission);

      expect(policy.kind).toBe('gated');
      if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
      expect(policy.condition.sql).toMatch(
        /^"company"."id" = ANY\(ARRAY\(SELECT "company_recordShare"."recordId" FROM "workspace"."recordShare"/,
      );
      expect(Object.values(policy.condition.parameters)).toContainEqual([
        'role-2',
        'member-1',
        'role-1',
      ]);
    });

    it('narrows edits of a subject without object permission to the records named for editing', () => {
      const policy = buildForCompany(withoutObjectPermission, 'update');

      if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
      expect(Object.values(policy.condition.parameters)).toEqual(
        expect.arrayContaining([
          ['role-2', 'member-1', 'role-1'],
          [RecordShareAccessLevel.READ_WRITE, RecordShareAccessLevel.FULL],
        ]),
      );
    });

    it('never lets general access reach beyond the role', () => {
      const policy = buildForCompany({
        ...withoutObjectPermission,
        principalIds: [EVERYONE_PRINCIPAL_ID, 'member-1'],
      });

      if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
      expect(Object.values(policy.condition.parameters)).toContainEqual([
        'member-1',
      ]);
    });

    it('keeps deletion with the role', () => {
      expect(buildForCompany(withoutObjectPermission, 'delete')).toEqual({
        kind: 'denied',
      });
    });

    it('denies a subject named nowhere', () => {
      expect(
        buildForCompany({
          ...withoutObjectPermission,
          principalIds: [EVERYONE_PRINCIPAL_ID],
        }),
      ).toEqual({ kind: 'denied' });
    });

    it('lets a named grant bypass the row filter of the role', () => {
      const policy = buildForCompany({
        ...readEverything,
        resolveRowLevelPermissionRecordFilter: () => NOTE_FILTER,
      });

      if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
      expect(policy.condition.sql).toMatch(
        /^\(\(\("company"."title" = :restricted\) AND \(NOT EXISTS .*\)\) OR \("company"."id" = ANY\(ARRAY\(SELECT "company_recordShare"."recordId"/,
      );
    });

    it('keeps the role limits when the object restricts sharing to the role', () => {
      expect(
        buildCompiledRowAccessPolicy({
          subject: withoutObjectPermission,
          environment: sharingEnvironment,
          tableAlias: 'company',
          flatObjectMetadata: {
            ...company,
            sharingReach: ObjectSharingReach.ROLE_ACCESS,
          },
          operationType: 'select',
          depth: 0,
        }),
      ).toEqual({ kind: 'denied' });
    });
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
      const policy = buildCompiledRowAccessPolicy({
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

  describe('DISCOVERABLE objects', () => {
    const discoverablePerson = {
      ...person,
      readability: MetadataReadability.DISCOVERABLE,
    };
    const readExistence: RowAccessPolicySubject = {
      ...readEverything,
      readScope: 'existence',
    };

    beforeEach(() => {
      jest.mocked(resolveInheritedReadabilityParents).mockReturnValue([
        {
          kind: 'column',
          fieldMetadataId: 'target-person-field-id',
          joinColumnName: 'targetPersonId',
          parentFlatObjectMetadata: discoverablePerson,
        },
      ]);
    });

    it('gates an ordinary read on share rows like a PRIVATE object', () => {
      expect(gatedSql(readEverything, discoverablePerson)).toContain(
        '"person_recordShare"."recordId" = "person"."id"',
      );
    });

    it('opens an existence read to the role predicate alone', () => {
      expect(build(readExistence, discoverablePerson)).toEqual({
        kind: 'open',
      });
      expect(
        gatedSql(
          {
            ...readExistence,
            resolveRowLevelPermissionRecordFilter: () => NOTE_FILTER,
          },
          discoverablePerson,
        ),
      ).toBe('("person"."title" = :restricted)');
    });

    it('keeps writes gated on share rows in an existence read', () => {
      const policy = buildCompiledRowAccessPolicy({
        subject: readExistence,
        environment,
        tableAlias: 'person',
        flatObjectMetadata: discoverablePerson,
        operationType: 'update',
        depth: 0,
      });

      expect(policy.kind).toBe('gated');
      if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
      expect(policy.condition.sql).toContain('recordShare');
    });

    it('discovers the parent of a child that declares discoverable fields', () => {
      const sql = gatedSql(readExistence, {
        ...attachment,
        discoverableFieldUniversalIdentifiers: [
          'discoverable-field-universal-identifier',
        ],
      });

      expect(sql).toContain('"attachment"."targetPersonId" IS NOT NULL');
      expect(sql).not.toContain('attachment_targetPersonId_recordShare');
    });

    it('does not open a child that declares no discoverable fields when joined from its discovered parent', () => {
      const policy = buildCompiledRowAccessPolicy({
        subject: readExistence,
        environment,
        tableAlias: 'attachment',
        flatObjectMetadata: attachment,
        operationType: 'select',
        depth: 0,
        joinParentRelationShape: {
          targetFieldMetadataId: 'target-person-field-id',
        } as never,
      });

      expect(policy.kind).toBe('gated');
      if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
      expect(policy.condition.sql).toContain(
        'attachment_targetPersonId_recordShare',
      );
    });

    it('opens a discoverable child joined from its discovered parent', () => {
      expect(
        buildRowAccessPolicy({
          subject: readExistence,
          environment,
          tableAlias: 'attachment',
          flatObjectMetadata: {
            ...attachment,
            discoverableFieldUniversalIdentifiers: [
              'discoverable-field-universal-identifier',
            ],
          },
          operationType: 'select',
          depth: 0,
          joinParentRelationShape: {
            targetFieldMetadataId: 'target-person-field-id',
          } as never,
        }),
      ).toEqual({ kind: 'open' });
    });

    it('keeps the parent gated for a child that declares no discoverable fields', () => {
      expect(gatedSql(readExistence, attachment)).toContain(
        'attachment_targetPersonId_recordShare',
      );
    });
  });

  it('keeps private records gated regardless of the sharing UI flag', () => {
    const policy = buildCompiledRowAccessPolicy({
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
