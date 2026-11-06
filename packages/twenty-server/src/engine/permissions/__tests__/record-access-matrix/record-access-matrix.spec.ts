import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  computeMatrix,
  describeEntry,
  type MatrixEntry,
} from 'src/engine/permissions/__tests__/record-access-matrix/compute-record-access-matrix.util';
import {
  MEMBER,
  MEMBER_THROUGH_AGENT,
  MEMBER_THROUGH_APPLICATION,
  READ_BY_HAND,
  shareWith,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.hand-cases';
import {
  ACCESS_LEVELS_BY_OPERATION,
  CURRENT_RULES,
  decideRecordAccess,
  LIMITING_ROLE_ID,
  type MatrixRow,
  type MatrixRules,
  type RoleGrant,
  STATED_RULES,
  WORKSPACE_MEMBER_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.model';
import { MATRIX_ROWS } from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.world';

const findRowOrThrow = (row: Partial<MatrixRow>): MatrixRow => {
  const foundRow = MATRIX_ROWS.find((candidate) =>
    Object.entries({
      isPrivate: false,
      isCreatedByActor: false,
      matchesMainRoleFilter: true,
      matchesLimitingRoleFilter: true,
      sharePrincipalId: undefined,
      shareAccessLevel: undefined,
      ...row,
    }).every(([key, value]) => candidate[key as keyof MatrixRow] === value),
  );

  if (!isDefined(foundRow)) {
    throw new Error(`No matrix row for ${JSON.stringify(row)}`);
  }

  return foundRow;
};

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
        decideRecordAccess({ scenario: { ...entry, row }, rules }).isGranted !==
        entry.grantedRecordIds.has(row.id),
    ).map((row) => {
      const { reason } = decideRecordAccess({
        scenario: { ...entry, row },
        rules,
      });

      return `${describeEntry(entry)} / ${row.id}: expected ${entry.grantedRecordIds.has(row.id) ? 'deny' : 'grant'} (${reason})`;
    });

  it('covers every combination', () => {
    expect(entries.length * MATRIX_ROWS.length).toBeGreaterThan(100000);
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

      expect(entry?.grantedRecordIds.has(findRowOrThrow(row).id)).toBe(
        isGranted,
      );
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
        { canEveryoneShareGrantAccess: true },
        MEMBER,
        shareWith({
          principalId: EVERYONE_PRINCIPAL_ID,
          accessLevel: RecordShareAccessLevel.READ,
        }),
      ],
      [
        'a limiting role with no access does not stop a share',
        { shouldLimitingRoleBoundRecordGrants: true },
        MEMBER_THROUGH_AGENT,
        shareWith({
          principalId: WORKSPACE_MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        }),
      ],
      [
        'a share to the limiting role reaches the member',
        {
          canLimitingRoleShareReachActor: false,
          shouldLimitingRoleBoundRecordGrants: true,
        },
        MEMBER_THROUGH_AGENT,
        shareWith({
          principalId: LIMITING_ROLE_ID,
          accessLevel: RecordShareAccessLevel.READ,
        }),
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
      const row = findRowOrThrow(rowFields);

      expect(
        decideRecordAccess({
          scenario: { ...entry, row },
          rules: buildScenarioRules(statedRule),
        }).isGranted,
      ).not.toBe(entry.grantedRecordIds.has(row.id));
    });

    it('keeps the stated rules distinct from the current ones', () => {
      expect(STATED_RULES).not.toEqual(CURRENT_RULES);
    });
  });

  describe('invariants', () => {
    const groupKey = (
      entry: MatrixEntry,
      omittedGrant: 'mainRoleGrant' | 'limitingRoleGrant',
    ) =>
      JSON.stringify({
        actorName: entry.actor.name,
        operationType: entry.operationType,
        isSharingEnabled: entry.isSharingEnabled,
        mainRoleGrant: entry.mainRoleGrant,
        limitingRoleGrant: entry.limitingRoleGrant,
        [omittedGrant]: undefined,
      });

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

          if (!isDefined(narrowerEntry) || !isDefined(widerEntry)) {
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

        return !isDefined(unlimited)
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
          decideRecordAccess({ scenario: { ...entry, row } }),
        );
        const hasReason = (reason: string) =>
          decisions.some((decision) => decision.reason === reason);
        const isMissing = (expected: unknown) =>
          !parameterValues.includes(JSON.stringify(expected));
        const label = describeEntry(entry);
        const roleGrants = entry.actor.hasLimitingRole
          ? [entry.mainRoleGrant, entry.limitingRoleGrant]
          : [entry.mainRoleGrant];
        const isReachedByRoles = !roleGrants.includes('none');
        const isHeldToMainFilter =
          isReachedByRoles && entry.mainRoleGrant === 'rowLevel';
        const isHeldToLimitingFilter =
          isReachedByRoles &&
          entry.actor.hasLimitingRole &&
          entry.limitingRoleGrant === 'rowLevel';

        return [
          hasReason('share') &&
          (isMissing(ACCESS_LEVELS_BY_OPERATION[entry.operationType]) ||
            !sql.includes('"accessLevel"'))
            ? `${label}: share clause lacks its access levels`
            : undefined,
          hasReason('creator') && isMissing(WORKSPACE_MEMBER_ID)
            ? `${label}: creator clause lacks the member`
            : undefined,
          isHeldToMainFilter !== sql.includes('"status"')
            ? `${label}: main role filter ${isHeldToMainFilter ? 'missing' : 'unexpected'}`
            : undefined,
          isHeldToLimitingFilter !== sql.includes('"category"')
            ? `${label}: limiting role filter ${isHeldToLimitingFilter ? 'missing' : 'unexpected'}`
            : undefined,
        ].filter((violation) => violation !== undefined);
      });

      expect(violations.slice(0, 20)).toEqual([]);
    });

    it('filters events like it decides records', () => {
      const violations = entries
        .filter(
          ({ readableEventRecordIds, grantedRecordIds }) =>
            isDefined(readableEventRecordIds) &&
            [...readableEventRecordIds].sort().join() !==
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
