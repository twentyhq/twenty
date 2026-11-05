import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectRecordsOperationType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import {
  ACCESS_LEVELS_BY_OPERATION,
  CURRENT_RULES,
  decideRecordAccess,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  type MatrixActor,
  type MatrixRow,
  type MatrixRules,
  type RoleGrant,
  STATED_RULES,
  WORKSPACE_MEMBER_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.model';
import {
  buildMatrixCacheValues,
  FLAT_OBJECT_METADATA,
  MATRIX_ACTORS,
  MATRIX_PRIVATE_RECORD_STATES,
  MATRIX_RECORD_SHARES,
  MATRIX_ROWS,
  toRecord,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.world';
import { buildMatrixServices } from 'src/engine/permissions/__tests__/record-access-matrix/build-matrix-services.util';
import { buildPermissionsCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-condition.util';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

const ROLE_GRANTS: RoleGrant[] = ['none', 'rowLevel', 'allRecords'];
const OPERATION_TYPES = [
  'select',
  'update',
  'soft-delete',
  'restore',
  'delete',
] as const satisfies ObjectRecordsOperationType[];
const SOME_RECORDS_QUESTIONS = {
  select: 'canReadSomeRecords',
  update: 'canUpdateSomeRecords',
  'soft-delete': 'canSoftDeleteSomeRecords',
  restore: 'canSoftDeleteSomeRecords',
  delete: 'canDestroySomeRecords',
} as const;

const RECORDS = MATRIX_ROWS.map(toRecord);
const EVENTS = MATRIX_ROWS.map(
  (row) =>
    ({
      recordId: row.id,
      properties: { after: toRecord(row) },
    }) as unknown as ObjectRecordEvent,
);

type MatrixEntry = {
  actor: MatrixActor;
  operationType: (typeof OPERATION_TYPES)[number];
  isSharingEnabled: boolean;
  mainRoleGrant: RoleGrant;
  limitingRoleGrant: RoleGrant;
  grantedRecordIds: Set<string>;
  sqlCondition: SqlCondition | boolean;
  canReachSomeRecords: boolean;
  readableEventRecordIds: Set<string> | undefined;
};

const describeEntry = ({
  actor,
  operationType,
  isSharingEnabled,
  mainRoleGrant,
  limitingRoleGrant,
}: Omit<
  MatrixEntry,
  | 'grantedRecordIds'
  | 'sqlCondition'
  | 'canReachSomeRecords'
  | 'readableEventRecordIds'
>) =>
  `${actor.name} / ${operationType} / sharing ${isSharingEnabled ? 'on' : 'off'} / main ${mainRoleGrant} / limiting ${limitingRoleGrant}`;

const computeMatrix = async (): Promise<MatrixEntry[]> => {
  const entries: MatrixEntry[] = [];

  for (const isSharingEnabled of [true, false]) {
    for (const mainRoleGrant of ROLE_GRANTS) {
      for (const limitingRoleGrant of ROLE_GRANTS) {
        const services = buildMatrixServices(
          buildMatrixCacheValues({
            mainRoleGrant,
            limitingRoleGrant,
            isSharingEnabled,
          }),
        );
        const metadataMaps = await services.permissionsMetadataMapsService.load(
          { workspaceId: WORKSPACE_ID },
        );

        for (const { actor, authContext } of MATRIX_ACTORS) {
          if (!actor.hasLimitingRole && limitingRoleGrant !== 'none') {
            continue;
          }

          const principals =
            await services.principalPermissionsService.buildPermissionsPrincipalsOrThrow(
              { authContext },
            );

          for (const operationType of OPERATION_TYPES) {
            const request = {
              principals,
              metadataMaps,
              flatObjectMetadata: FLAT_OBJECT_METADATA,
              operationType,
            };

            entries.push({
              actor,
              operationType,
              isSharingEnabled,
              mainRoleGrant,
              limitingRoleGrant,
              grantedRecordIds: await findGrantedRecordIds({
                ...request,
                records: RECORDS,
                context: {
                  shouldIgnoreSoftDeleteDefaultFilter: false,
                  fetchRecordShares: async () => MATRIX_RECORD_SHARES,
                  findPrivateRecordStates: async () =>
                    MATRIX_PRIVATE_RECORD_STATES,
                },
              }),
              sqlCondition: buildPermissionsCondition({
                ...request,
                recordShareTableExpression: 'record_share',
              }),
              canReachSomeRecords: await services.recordPermissionsService[
                SOME_RECORDS_QUESTIONS[operationType]
              ]({ principals, objectMetadataId: FLAT_OBJECT_METADATA.id }),
              readableEventRecordIds:
                operationType === 'select'
                  ? await services.recordPermissionsService.findReadableEventRecordIds(
                      {
                        authContext,
                        eventBatch: {
                          workspaceId: WORKSPACE_ID,
                          objectMetadata: FLAT_OBJECT_METADATA,
                          events: EVENTS,
                        } as never,
                      },
                    )
                  : undefined,
            });
          }
        }
      }
    }
  }

  return entries;
};

const findRow = (row: Partial<MatrixRow>): MatrixRow => {
  const foundRow = MATRIX_ROWS.find((candidate) =>
    Object.entries({
      isPrivate: false,
      isCreatedByActor: false,
      matchesRowLevelFilter: true,
      sharePrincipalId: undefined,
      shareAccessLevel: undefined,
      ...row,
    }).every(([key, value]) => candidate[key as keyof MatrixRow] === value),
  );

  if (foundRow === undefined) {
    throw new Error(`No matrix row for ${JSON.stringify(row)}`);
  }

  return foundRow;
};

const shareWith = (
  sharePrincipalId: string,
  shareAccessLevel: RecordShareAccessLevel,
) => ({ sharePrincipalId, shareAccessLevel });

const MEMBER = 'member';
const MEMBER_THROUGH_AGENT = 'member acting through an agent';
const MEMBER_THROUGH_APPLICATION = 'member acting through an application';
const MEMBER_THROUGH_OAUTH = 'member acting through an OAuth application';
const MEMBER_IN_AI_RUN = 'member in an AI run';
const API_KEY = 'API key';
const APPLICATION = 'application';

// Written by hand from the permission rules, independently of the model
const READ_BY_HAND: [
  name: string,
  actorName: string,
  operationType: (typeof OPERATION_TYPES)[number],
  sharing: 'on' | 'off',
  mainRoleGrant: RoleGrant,
  limitingRoleGrant: RoleGrant,
  row: Partial<MatrixRow>,
  isGranted: boolean,
][] = [
  [
    'all records reaches a public record',
    MEMBER,
    'select',
    'off',
    'allRecords',
    'none',
    {},
    true,
  ],
  [
    'all records stops at a private record',
    MEMBER,
    'select',
    'off',
    'allRecords',
    'none',
    { isPrivate: true },
    false,
  ],
  [
    'no role reaches nothing',
    MEMBER,
    'select',
    'off',
    'none',
    'none',
    {},
    false,
  ],
  [
    'row level keeps a matching record',
    MEMBER,
    'update',
    'off',
    'rowLevel',
    'none',
    {},
    true,
  ],
  [
    'row level drops a record outside its filter',
    MEMBER,
    'update',
    'off',
    'rowLevel',
    'none',
    { matchesRowLevelFilter: false },
    false,
  ],
  [
    'a creator keeps a private record',
    MEMBER,
    'select',
    'off',
    'allRecords',
    'none',
    { isPrivate: true, isCreatedByActor: true },
    true,
  ],
  [
    'a creator with no role and no sharing has nothing',
    MEMBER,
    'select',
    'off',
    'none',
    'none',
    { isPrivate: true, isCreatedByActor: true },
    false,
  ],
  [
    'a creator with no role reads through sharing',
    MEMBER,
    'select',
    'on',
    'none',
    'none',
    { isPrivate: true, isCreatedByActor: true },
    true,
  ],
  [
    'a creator with no role cannot delete through sharing',
    MEMBER,
    'delete',
    'on',
    'none',
    'none',
    { isPrivate: true, isCreatedByActor: true },
    false,
  ],
  [
    'an API key is no creator',
    API_KEY,
    'select',
    'on',
    'allRecords',
    'none',
    { isPrivate: true, isCreatedByActor: true },
    false,
  ],
  [
    'an application is no creator',
    APPLICATION,
    'select',
    'on',
    'allRecords',
    'none',
    { isPrivate: true, isCreatedByActor: true },
    false,
  ],
  [
    'a read share lets a member read beyond its role',
    MEMBER,
    'select',
    'on',
    'none',
    'none',
    shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ),
    true,
  ],
  [
    'a read share does not let a member update',
    MEMBER,
    'update',
    'on',
    'none',
    'none',
    shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ),
    false,
  ],
  [
    'a write share lets a member update beyond its role',
    MEMBER,
    'update',
    'on',
    'none',
    'none',
    shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ_WRITE),
    true,
  ],
  [
    'a full share never deletes beyond the role',
    MEMBER,
    'delete',
    'on',
    'none',
    'none',
    shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.FULL),
    false,
  ],
  [
    'a share of no access grants nothing',
    MEMBER,
    'select',
    'on',
    'none',
    'none',
    shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.NONE),
    false,
  ],
  [
    'a share to another member grants nothing',
    MEMBER,
    'select',
    'on',
    'none',
    'none',
    shareWith('other-workspace-member-id', RecordShareAccessLevel.READ),
    false,
  ],
  [
    'a share to the main role reaches the member',
    MEMBER,
    'select',
    'on',
    'none',
    'none',
    shareWith(MAIN_ROLE_ID, RecordShareAccessLevel.READ),
    true,
  ],
  [
    'a share to the role reaches an API key',
    API_KEY,
    'select',
    'on',
    'none',
    'none',
    shareWith(MAIN_ROLE_ID, RecordShareAccessLevel.READ),
    true,
  ],
  [
    'a share is ignored while sharing is off, on a public record',
    MEMBER,
    'select',
    'off',
    'none',
    'none',
    shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ),
    false,
  ],
  [
    'a share opens a private record to a role that reaches it, sharing off',
    MEMBER,
    'select',
    'off',
    'allRecords',
    'none',
    {
      isPrivate: true,
      ...shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ),
    },
    true,
  ],
  [
    'a full share deletes a private record the role reaches',
    MEMBER,
    'delete',
    'on',
    'allRecords',
    'none',
    {
      isPrivate: true,
      ...shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.FULL),
    },
    true,
  ],
  [
    'a write share does not delete a private record',
    MEMBER,
    'delete',
    'on',
    'allRecords',
    'none',
    {
      isPrivate: true,
      ...shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ_WRITE),
    },
    false,
  ],
  [
    'a share on a private record stays held to row level when not beyond the role',
    MEMBER,
    'delete',
    'on',
    'rowLevel',
    'none',
    {
      isPrivate: true,
      matchesRowLevelFilter: false,
      ...shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.FULL),
    },
    false,
  ],
  [
    'a share beyond the role passes a row level filter',
    MEMBER,
    'select',
    'on',
    'rowLevel',
    'none',
    {
      matchesRowLevelFilter: false,
      ...shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ),
    },
    true,
  ],
  [
    'an AI run never reaches beyond its roles',
    MEMBER_IN_AI_RUN,
    'select',
    'on',
    'none',
    'none',
    shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ),
    false,
  ],
  [
    'an AI run keeps what its role reaches',
    MEMBER_IN_AI_RUN,
    'select',
    'on',
    'allRecords',
    'none',
    {},
    true,
  ],
  [
    'a limiting role of no access blocks the main role',
    MEMBER_THROUGH_AGENT,
    'select',
    'off',
    'allRecords',
    'none',
    {},
    false,
  ],
  [
    'an application role of no access blocks the main role',
    MEMBER_THROUGH_APPLICATION,
    'select',
    'off',
    'allRecords',
    'none',
    {},
    false,
  ],
  [
    'a row level limiting role narrows all records',
    MEMBER_THROUGH_AGENT,
    'select',
    'off',
    'allRecords',
    'rowLevel',
    { matchesRowLevelFilter: false },
    false,
  ],
  [
    'a row level main role narrows an unrestricted limiting role',
    MEMBER_THROUGH_AGENT,
    'select',
    'off',
    'rowLevel',
    'allRecords',
    { matchesRowLevelFilter: false },
    false,
  ],
  [
    'both grants open reach the record',
    MEMBER_THROUGH_AGENT,
    'update',
    'off',
    'allRecords',
    'allRecords',
    {},
    true,
  ],
  [
    'an OAuth application acts with the member role',
    MEMBER_THROUGH_OAUTH,
    'update',
    'off',
    'allRecords',
    'none',
    {},
    true,
  ],
];

describe('record access matrix', () => {
  let entries: MatrixEntry[];

  beforeAll(async () => {
    entries = await computeMatrix();
  });

  const collectDisagreements = ({
    rules,
    entry,
  }: {
    rules: MatrixRules;
    entry: MatrixEntry;
  }) =>
    MATRIX_ROWS.filter(
      (row) =>
        decideRecordAccess({ ...entry, row }, rules).isGranted !==
        entry.grantedRecordIds.has(row.id),
    ).map((row) => {
      const { reason } = decideRecordAccess({ ...entry, row }, rules);

      return `${describeEntry(entry)} / ${row.id}: expected ${entry.grantedRecordIds.has(row.id) ? 'deny' : 'grant'} (${reason})`;
    });

  it('covers every combination', () => {
    expect(entries.length * MATRIX_ROWS.length).toBeGreaterThan(50000);
  });

  it('decides every combination as the rules say', () => {
    expect(
      entries
        .flatMap((entry) =>
          collectDisagreements({ rules: CURRENT_RULES, entry }),
        )
        .slice(0, 30),
    ).toEqual([]);
  });

  it.each(READ_BY_HAND)(
    '%s',
    (
      _name,
      actorName,
      operationType,
      sharing,
      mainRoleGrant,
      limitingRoleGrant,
      row,
      isGranted,
    ) => {
      const entry = entries.find(
        (candidate) =>
          candidate.actor.name === actorName &&
          candidate.operationType === operationType &&
          candidate.isSharingEnabled === (sharing === 'on') &&
          candidate.mainRoleGrant === mainRoleGrant &&
          candidate.limitingRoleGrant === limitingRoleGrant,
      );

      expect(entry?.grantedRecordIds.has(findRow(row).id)).toBe(isGranted);
    },
  );

  describe('where the code differs from the stated rules', () => {
    const buildScenarioRules = (rules: Partial<MatrixRules>): MatrixRules => ({
      ...CURRENT_RULES,
      ...rules,
    });

    it.each<[string, Partial<MatrixRules>, string, Partial<MatrixRow>]>([
      [
        'an everyone share row grants nothing',
        { everyoneShareGrantsAccess: true },
        MEMBER,
        shareWith(EVERYONE_PRINCIPAL_ID, RecordShareAccessLevel.READ),
      ],
      [
        'a limiting role with no access does not stop a share',
        { limitingRoleBoundsRecordGrants: true },
        MEMBER_THROUGH_AGENT,
        shareWith(WORKSPACE_MEMBER_ID, RecordShareAccessLevel.READ),
      ],
      [
        'a share to the limiting role reaches the member',
        {
          limitingRoleShareReachesActor: false,
          limitingRoleBoundsRecordGrants: true,
        },
        MEMBER_THROUGH_AGENT,
        shareWith(LIMITING_ROLE_ID, RecordShareAccessLevel.READ),
      ],
    ])('%s', (_name, statedRule, actorName, rowFields) => {
      const entry = entries.find(
        (candidate) =>
          candidate.actor.name === actorName &&
          candidate.operationType === 'select' &&
          candidate.isSharingEnabled &&
          candidate.mainRoleGrant === 'none' &&
          candidate.limitingRoleGrant === 'none',
      ) as MatrixEntry;
      const row = findRow(rowFields);

      expect(
        decideRecordAccess({ ...entry, row }, buildScenarioRules(statedRule))
          .isGranted,
      ).not.toBe(entry.grantedRecordIds.has(row.id));
    });

    it('keeps the stated rules distinct from the current ones', () => {
      expect(STATED_RULES).not.toEqual(CURRENT_RULES);
    });
  });

  describe('invariants', () => {
    const groupKey = (entry: MatrixEntry, ...omitted: (keyof MatrixEntry)[]) =>
      JSON.stringify(
        [
          'actor',
          'operationType',
          'isSharingEnabled',
          'mainRoleGrant',
          'limitingRoleGrant',
        ].map((key) =>
          omitted.includes(key as keyof MatrixEntry)
            ? undefined
            : key === 'actor'
              ? entry.actor.name
              : entry[key as keyof MatrixEntry],
        ),
      );

    const findMissingFromWiderGrant = (
      grantKey: 'mainRoleGrant' | 'limitingRoleGrant',
    ) => {
      const violations: string[] = [];
      const entriesByGroup = new Map<string, MatrixEntry[]>();

      for (const entry of entries) {
        const key = groupKey(entry, grantKey);

        entriesByGroup.set(key, [...(entriesByGroup.get(key) ?? []), entry]);
      }

      for (const group of entriesByGroup.values()) {
        const byGrant = (grant: RoleGrant) =>
          group.find((entry) => entry[grantKey] === grant);

        for (const [narrower, wider] of [
          ['none', 'rowLevel'],
          ['rowLevel', 'allRecords'],
        ] as const) {
          const narrowerEntry = byGrant(narrower);
          const widerEntry = byGrant(wider);

          if (narrowerEntry === undefined || widerEntry === undefined) {
            continue;
          }

          for (const recordId of narrowerEntry.grantedRecordIds) {
            if (!widerEntry.grantedRecordIds.has(recordId)) {
              violations.push(`${describeEntry(widerEntry)} loses ${recordId}`);
            }
          }
        }
      }

      return violations.slice(0, 20);
    };

    it('never removes access when the main role grants more', () => {
      expect(findMissingFromWiderGrant('mainRoleGrant')).toEqual([]);
    });

    it('never removes access when the limiting role grants more', () => {
      expect(findMissingFromWiderGrant('limitingRoleGrant')).toEqual([]);
    });

    it('never adds access through a limiting role, shares to that role aside', () => {
      const unlimitedActorName = new Map([
        [MEMBER_THROUGH_AGENT, MEMBER],
        [MEMBER_THROUGH_APPLICATION, MEMBER],
      ]);
      const limitingRoleRowIds = new Set(
        MATRIX_ROWS.filter(
          ({ sharePrincipalId }) => sharePrincipalId === LIMITING_ROLE_ID,
        ).map(({ id }) => id),
      );
      const violations = entries.flatMap((entry) => {
        const unlimited = entries.find(
          (candidate) =>
            candidate.actor.name === unlimitedActorName.get(entry.actor.name) &&
            candidate.operationType === entry.operationType &&
            candidate.isSharingEnabled === entry.isSharingEnabled &&
            candidate.mainRoleGrant === entry.mainRoleGrant,
        );

        return unlimited === undefined
          ? []
          : [...entry.grantedRecordIds]
              .filter(
                (recordId) =>
                  !unlimited.grantedRecordIds.has(recordId) &&
                  !limitingRoleRowIds.has(recordId),
              )
              .map((recordId) => `${describeEntry(entry)} adds ${recordId}`);
      });

      expect(violations.slice(0, 20)).toEqual([]);
    });

    it('agrees with the SQL decision when that decision is a plain answer', () => {
      const violations = entries.flatMap((entry) => {
        if (entry.sqlCondition === false && entry.grantedRecordIds.size > 0) {
          return [`SQL denies, memory grants: ${describeEntry(entry)}`];
        }

        return entry.sqlCondition === true &&
          entry.grantedRecordIds.size !== MATRIX_ROWS.length
          ? [`SQL grants all, memory does not: ${describeEntry(entry)}`]
          : [];
      });

      expect(violations).toEqual([]);
    });

    it('writes the same rules into its SQL condition', () => {
      const violations = entries.flatMap((entry) => {
        if (typeof entry.sqlCondition !== 'object') {
          return [];
        }

        const { sql, parameters } = entry.sqlCondition;
        const parameterValues = Object.values(parameters).map((value) =>
          JSON.stringify(value),
        );
        const decisions = MATRIX_ROWS.map((row) =>
          decideRecordAccess({ ...entry, row }),
        );
        const hasReason = (reason: string) =>
          decisions.some((decision) => decision.reason === reason);
        const isMissing = (expected: unknown) =>
          !parameterValues.includes(JSON.stringify(expected));
        const label = describeEntry(entry);
        const roleGrants = entry.actor.hasLimitingRole
          ? [entry.mainRoleGrant, entry.limitingRoleGrant]
          : [entry.mainRoleGrant];
        const isHeldToRowLevelFilter =
          roleGrants.includes('rowLevel') && !roleGrants.includes('none');

        return [
          hasReason('share') &&
          (isMissing(ACCESS_LEVELS_BY_OPERATION[entry.operationType]) ||
            !sql.includes('"accessLevel"'))
            ? `${label}: share clause lacks its access levels`
            : undefined,
          hasReason('creator') && isMissing(WORKSPACE_MEMBER_ID)
            ? `${label}: creator clause lacks the member`
            : undefined,
          isHeldToRowLevelFilter && !sql.includes('"status"')
            ? `${label}: row level filter missing`
            : undefined,
          !isHeldToRowLevelFilter && sql.includes('"status"')
            ? `${label}: unexpected row level filter`
            : undefined,
        ].filter((violation) => violation !== undefined);
      });

      expect(violations.slice(0, 20)).toEqual([]);
    });

    it('filters events like it decides records', () => {
      const violations = entries
        .filter(({ readableEventRecordIds }) => readableEventRecordIds)
        .filter(
          ({ readableEventRecordIds, grantedRecordIds }) =>
            [...(readableEventRecordIds as Set<string>)].sort().join() !==
            [...grantedRecordIds].sort().join(),
        )
        .map(describeEntry);

      expect(violations).toEqual([]);
    });

    it('only hides from the object level answer a creator reading its own private records', () => {
      const rowById = new Map(MATRIX_ROWS.map((row) => [row.id, row]));
      const violations = entries
        .filter(({ canReachSomeRecords }) => !canReachSomeRecords)
        .flatMap((entry) =>
          [...entry.grantedRecordIds]
            .filter((recordId) => {
              const row = rowById.get(recordId);

              return !(row?.isPrivate && row.isCreatedByActor);
            })
            .map((recordId) => `${describeEntry(entry)}: ${recordId}`),
        );

      expect(violations.slice(0, 20)).toEqual([]);
    });
  });
});
