import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  MetadataReadability,
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

jest.mock(
  'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util',
);

const APPLICATION_ID = 'application-id';
const NOTE_FILTER = { title: { eq: 'restricted' } };

const buildObject = ({ id }: { id: string }): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id,
    nameSingular: id,
    namePlural: `${id}s`,
    universalIdentifier: `${id}-universal-identifier`,
    applicationId: APPLICATION_ID,
    isSystem: false,
  } as Parameters<typeof getFlatObjectMetadataMock>[0]);

const note = buildObject({ id: 'note' });
const person: FlatObjectMetadata = {
  ...buildObject({ id: 'person' }),
  readability: MetadataReadability.PRIVATE,
};

const environment: RowAccessPolicyEnvironment &
  RowAccessCompilationEnvironment = {
  flatFieldMetadataMaps: { byId: {} } as never,
  flatObjectMetadataMaps: { byId: {} } as never,
  recordShareTableExpression: '"workspace"."recordShare"',
  featureFlagsMap: {},
};
const sharingEnvironment = {
  ...environment,
  featureFlagsMap: { [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true },
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
    (renderRowLevelPermissionFilterToSql as jest.Mock).mockImplementation(
      ({ tableAlias }: { tableAlias: string }) => ({
        sql: `"${tableAlias}"."title" = :restricted`,
        parameters: { restricted: 'restricted' },
      }),
    );
  });

  it('allows trusted system reads and writes', () => {
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
          flatObjectMetadata: note,
          operationType,
        }),
      ).toEqual({ kind: 'open' });
    }
  });

  it('keeps records of an object that disables reading to its owning application', () => {
    const object = {
      ...note,
      disabledObjectPermissionActions: ['canReadObjectRecords' as const],
    };
    expect(build(readEverything, object)).toEqual({ kind: 'denied' });
    expect(
      build({ ...readEverything, isOwningApplication: () => true }, object),
    ).toEqual({ kind: 'open' });
  });

  it('opens an object to a subject without predicate', () => {
    expect(build(readEverything, note)).toEqual({ kind: 'open' });
  });

  it('gates an object on its restrictions once record sharing is enabled', () => {
    const company = buildObject({ id: 'company' });
    const policy = buildCompiledRowAccessPolicy({
      subject: readEverything,
      environment: sharingEnvironment,
      tableAlias: 'company',
      flatObjectMetadata: company,
      operationType: 'select',
    });

    expect(policy.kind).toBe('gated');
    if (policy.kind !== 'gated') throw new Error('Expected an exception gate');
    expect(policy.condition.sql).toMatch(
      /^\(NOT EXISTS \(SELECT 1 FROM "workspace"."recordShare" AS "recordShareRestriction_[0-9a-f]{10}"/,
    );
  });

  it('lifts the restrictions of an object for a subject with access to all records', () => {
    expect(
      buildCompiledRowAccessPolicy({
        subject: { ...readEverything, canAccessAllRecords: true },
        environment: sharingEnvironment,
        tableAlias: 'note',
        flatObjectMetadata: note,
        operationType: 'select',
      }),
    ).toEqual({ kind: 'open' });
  });

  it('keeps PRIVATE records gated for a subject with access to all records', () => {
    expect(
      gatedSql({ ...readEverything, canAccessAllRecords: true }, person),
    ).toContain('recordShare');
  });

  it('keeps a system object open when record sharing is enabled', () => {
    expect(
      buildCompiledRowAccessPolicy({
        subject: readEverything,
        environment: sharingEnvironment,
        tableAlias: 'note',
        flatObjectMetadata: { ...note, isSystem: true },
        operationType: 'select',
      }),
    ).toEqual({ kind: 'open' });
  });

  it('leaves an object open to inserts when record sharing is enabled', () => {
    expect(
      buildCompiledRowAccessPolicy({
        subject: readEverything,
        environment: sharingEnvironment,
        tableAlias: 'note',
        flatObjectMetadata: note,
        operationType: 'insert',
      }),
    ).toEqual({ kind: 'open' });
  });

  describe('with a record shared beyond the role', () => {
    const company = buildObject({ id: 'company' });
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
  });

  it('denies an object the subject has no permission on', () => {
    expect(build({ ...readEverything, objectsPermissions: {} }, note)).toEqual({
      kind: 'denied',
    });
  });

  it('gates an object on the role predicate alone', () => {
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

  it('keeps a PRIVATE object open for its owning application', () => {
    expect(
      build({ ...readEverything, isOwningApplication: () => true }, person),
    ).toEqual({ kind: 'open' });
  });

  it('keeps private records gated regardless of the sharing UI flag', () => {
    const policy = buildCompiledRowAccessPolicy({
      subject: readEverything,
      environment,
      tableAlias: 'person',
      flatObjectMetadata: person,
      operationType: 'select',
    });
    expect(policy.kind).toBe('gated');
    if (policy.kind !== 'gated') throw new Error('Expected a grant gate');
    expect(policy.condition.sql).toContain('recordShare');
    expect(policy.condition.sql).not.toContain('rowCause');
  });
});
