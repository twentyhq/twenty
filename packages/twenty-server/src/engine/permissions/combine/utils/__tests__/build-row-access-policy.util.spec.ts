import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type RowAccessCompilationEnvironment,
  type RowAccessPolicyEnvironment,
  type RowAccessPolicySubject,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { buildRowAccessPolicy } from 'src/engine/permissions/combine/utils/build-row-access-policy.util';
import { compileRowAccessPolicy } from 'src/engine/permissions/combine/utils/compile-row-access-policy.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/rls/utils/render-row-level-permission-filter-to-sql.util';

jest.mock(
  'src/engine/permissions/rls/utils/render-row-level-permission-filter-to-sql.util',
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
  universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
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
  featureFlagsMap: {
    [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
    [FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED]: true,
  },
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
  workspaceMemberId: 'member-1',
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

  it('keeps private records to their creator and shares once record sharing is enabled', () => {
    const company = buildObject({ id: 'company' });
    const policy = buildCompiledRowAccessPolicy({
      subject: readEverything,
      environment: sharingEnvironment,
      tableAlias: 'company',
      flatObjectMetadata: company,
      operationType: 'select',
    });

    expect(policy.kind).toBe('gated');
    if (policy.kind !== 'gated') {
      throw new Error('Expected a privacy gate');
    }
    expect(policy.condition.sql).toContain(
      '("company"."_isPrivate" = FALSE) OR',
    );
    expect(policy.condition.sql).toContain('"workspace"."recordShare"');
  });

  it('leaves records open to their role until private records are enabled', () => {
    expect(
      buildCompiledRowAccessPolicy({
        subject: readEverything,
        environment: {
          ...environment,
          featureFlagsMap: {
            [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
          },
        },
        tableAlias: 'company',
        flatObjectMetadata: buildObject({ id: 'company' }),
        operationType: 'select',
      }),
    ).toEqual({ kind: 'open' });
  });

  it('keeps records of a PRIVATE object gated on their shares', () => {
    expect(gatedSql(readEverything, person)).toContain('recordShare');
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
        /^\(\(\("company"."title" = :restricted\) AND \(\(\("company"."_isPrivate" = FALSE\) OR .*\)\)\) OR \("company"."id" = ANY\(ARRAY\(SELECT "company_recordShare"."recordId"/,
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
  describe('with a prospective named share', () => {
    const prospectiveShareArguments = {
      subject: readEverything,
      environment: sharingEnvironment,
      tableAlias: person.nameSingular,
      flatObjectMetadata: person,
      operationType: 'update',
      hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ_WRITE,
    } satisfies Parameters<typeof buildCompiledRowAccessPolicy>[0];

    it('requires an edit-level share to preview update access', () => {
      expect(buildCompiledRowAccessPolicy(prospectiveShareArguments)).toEqual({
        kind: 'open',
      });
      const readOnly = buildCompiledRowAccessPolicy({
        ...prospectiveShareArguments,
        hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ,
      });

      expect(readOnly.kind).toBe('gated');
    });

    it('preserves the member-bound row filter when sharing cannot reach beyond the role', () => {
      const policy = buildCompiledRowAccessPolicy({
        ...prospectiveShareArguments,
        environment,
        subject: {
          ...readEverything,
          resolveRowLevelPermissionRecordFilter: () => NOTE_FILTER,
        },
      });

      expect(policy).toMatchObject({
        kind: 'gated',
        condition: {
          sql: expect.stringContaining('"person"."title" = :restricted'),
        },
      });
      expect(policy).toMatchObject({
        condition: { sql: expect.not.stringContaining('recordShare') },
      });
    });

    it('preserves a disabled edit action', () => {
      expect(
        buildCompiledRowAccessPolicy({
          ...prospectiveShareArguments,
          flatObjectMetadata: {
            ...person,
            disabledObjectPermissionActions: [
              'canUpdateObjectRecords' as const,
            ],
          },
        }),
      ).toEqual({ kind: 'denied' });
    });

    it('honors ownership for an object that disables editing', () => {
      expect(
        buildCompiledRowAccessPolicy({
          ...prospectiveShareArguments,
          subject: { ...readEverything, isOwningApplication: () => true },
          flatObjectMetadata: {
            ...person,
            disabledObjectPermissionActions: [
              'canUpdateObjectRecords' as const,
            ],
          },
        }),
      ).toEqual({ kind: 'open' });
    });

    it('does not use a prospective share to bypass a disabled read action', () => {
      expect(
        buildCompiledRowAccessPolicy({
          ...prospectiveShareArguments,
          operationType: 'select',
          flatObjectMetadata: {
            ...person,
            disabledObjectPermissionActions: ['canReadObjectRecords' as const],
          },
        }),
      ).toEqual({ kind: 'denied' });
    });

    it('reaches beyond missing role access only when record sharing is enabled', () => {
      const withoutObjectPermission: RowAccessPolicySubject = {
        ...readEverything,
        objectsPermissions: {},
      };

      expect(
        buildCompiledRowAccessPolicy({
          ...prospectiveShareArguments,
          environment,
          subject: withoutObjectPermission,
        }),
      ).toEqual({ kind: 'denied' });
      expect(
        buildCompiledRowAccessPolicy({
          ...prospectiveShareArguments,
          subject: withoutObjectPermission,
        }),
      ).toEqual({ kind: 'open' });
    });
  });

  describe('with private records created by members', () => {
    const createdByField = getFlatFieldMetadataMock({
      objectMetadataId: 'company',
      type: FieldMetadataType.ACTOR,
      name: 'createdBy',
      universalIdentifier: 'company-created-by-field-universal-id',
    });
    const company = {
      ...buildObject({ id: 'company' }),
      fieldIds: [createdByField.id],
    };
    const emptyFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    };
    const creatorEnvironment = {
      ...sharingEnvironment,
      flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: createdByField,
        flatEntityMaps: emptyFlatFieldMetadataMaps,
      }),
    };
    const buildForCreator = (subject: RowAccessPolicySubject) =>
      buildCompiledRowAccessPolicy({
        subject,
        environment: creatorEnvironment,
        tableAlias: 'company',
        flatObjectMetadata: company,
        operationType: 'select',
      });

    it('admits a private record to its creator next to its shares', () => {
      const policy = buildForCreator(readEverything);

      if (policy.kind !== 'gated') {
        throw new Error('Expected a privacy gate');
      }
      expect(policy.condition.sql).toMatch(
        /^\(\(\("company"."_isPrivate" = FALSE\) OR \("company"."createdByWorkspaceMemberId" = :recordCreatedByWorkspaceMemberId_[0-9a-f]{10}\) OR \(EXISTS/,
      );
      expect(Object.values(policy.condition.parameters)).toContain('member-1');
    });

    it('lets the creator of a private record in whatever their role', () => {
      const policy = buildForCreator({
        ...readEverything,
        objectsPermissions: {},
        principalIds: [EVERYONE_PRINCIPAL_ID, 'member-1'],
      });

      if (policy.kind !== 'gated') {
        throw new Error('Expected a grant gate');
      }
      expect(policy.condition.sql).toContain(
        '("company"."_isPrivate" = TRUE) AND ("company"."createdByWorkspaceMemberId" = :',
      );
    });
  });
});
