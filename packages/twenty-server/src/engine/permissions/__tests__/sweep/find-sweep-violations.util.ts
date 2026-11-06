import { isDefined } from 'twenty-shared/utils';

import {
  findHeldRoles,
  type GivenPrincipals,
  type RecordOperation,
  type RoleGrant,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import { MEMBER_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import {
  describeSweepEntry,
  type SweepEntry,
} from 'src/engine/permissions/__tests__/sweep/compute-sweep.util';
import {
  ACCESS_LEVELS_BY_OPERATION,
  decideRecordAccess,
} from 'src/engine/permissions/__tests__/sweep/reference-rules.util';
import { SWEEP_RECORDS } from 'src/engine/permissions/__tests__/sweep/sweep-dimensions.util';

type PrincipalSlot =
  | 'mainPrincipal'
  | 'limitingPrincipal'
  | 'applicationPrincipal';

const NARROWER_TO_WIDER_GRANTS: [RoleGrant, RoleGrant][] = [
  ['none', 'rowLevel'],
  ['rowLevel', 'allRecords'],
];

const toEntryKey = ({
  world,
  operationType,
}: {
  world: object;
  operationType: RecordOperation;
}) => JSON.stringify({ world, operationType });

const buildEntryWithSlotKey = ({
  entry: { world, operationType },
  slot,
  principal,
}: {
  entry: Pick<SweepEntry, 'world' | 'operationType'>;
  slot: PrincipalSlot;
  principal: object;
}) => toEntryKey({ operationType, world: { ...world, [slot]: principal } });

const findRecordIdsMissingFrom = ({
  recordIds,
  widerRecordIds,
}: {
  recordIds: Set<string>;
  widerRecordIds: Set<string>;
}) => [...recordIds].filter((recordId) => !widerRecordIds.has(recordId));

export const findReferenceRuleDisagreements = (entries: SweepEntry[]) =>
  entries.flatMap((entry) =>
    SWEEP_RECORDS.flatMap((record) => {
      const { isGranted, reason } = decideRecordAccess({ ...entry, record });

      return isGranted === entry.grantedRecordIds.has(record.id)
        ? []
        : [
            `${describeSweepEntry(entry)} / ${record.id}: rules say ${isGranted ? 'grant' : 'deny'} (${reason})`,
          ];
    }),
  );

export const findAccessLostByWideningRole = ({
  entries,
  slot,
}: {
  entries: SweepEntry[];
  slot: PrincipalSlot;
}) => {
  const entriesByKey = new Map(
    entries.map((entry) => [toEntryKey(entry), entry]),
  );

  return entries.flatMap((entry) => {
    const principal = entry.world[slot];

    if (!('role' in principal)) {
      return [];
    }

    return NARROWER_TO_WIDER_GRANTS.flatMap(([narrower, wider]) => {
      if (principal.role !== narrower) {
        return [];
      }

      const widerEntry = entriesByKey.get(
        buildEntryWithSlotKey({
          entry,
          slot,
          principal: { ...principal, role: wider },
        }),
      );

      if (!isDefined(widerEntry)) {
        return [];
      }

      return findRecordIdsMissingFrom({
        recordIds: entry.grantedRecordIds,
        widerRecordIds: widerEntry.grantedRecordIds,
      }).map(
        (recordId) => `${describeSweepEntry(widerEntry)} loses ${recordId}`,
      );
    });
  });
};

export const findAccessAddedByPrincipal = ({
  entries,
  slot,
  withoutPrincipal,
  roleId,
}: {
  entries: SweepEntry[];
  slot: PrincipalSlot;
  withoutPrincipal: object;
  roleId: string;
}) => {
  const entriesByKey = new Map(
    entries.map((entry) => [toEntryKey(entry), entry]),
  );
  const recordIdsSharedToThatRole = new Set(
    SWEEP_RECORDS.filter(({ share }) => share?.principalId === roleId).map(
      ({ id }) => id,
    ),
  );

  return entries.flatMap((entry) => {
    const entryWithout = entriesByKey.get(
      buildEntryWithSlotKey({ entry, slot, principal: withoutPrincipal }),
    );

    return !isDefined(entryWithout) || entryWithout === entry
      ? []
      : findRecordIdsMissingFrom({
          recordIds: entry.grantedRecordIds,
          widerRecordIds: entryWithout.grantedRecordIds,
        })
          .filter((recordId) => !recordIdsSharedToThatRole.has(recordId))
          .map((recordId) => `${describeSweepEntry(entry)} adds ${recordId}`);
  });
};

export const findPlainSqlDisagreements = (entries: SweepEntry[]) =>
  entries.flatMap((entry) => {
    if (entry.sqlCondition === false && entry.grantedRecordIds.size > 0) {
      return [`SQL denies, memory grants: ${describeSweepEntry(entry)}`];
    }

    return entry.sqlCondition === true &&
      entry.grantedRecordIds.size !== SWEEP_RECORDS.length
      ? [`SQL grants all, memory does not: ${describeSweepEntry(entry)}`]
      : [];
  });

const findFiltersHeldByPrincipals = (world: GivenPrincipals<RoleGrant>) => {
  const { mainPrincipal, limitingPrincipal, applicationPrincipal } = world;
  const isReachedByRoles = findHeldRoles(world).every(
    (grant) => grant !== 'none',
  );

  return {
    status: isReachedByRoles && mainPrincipal.role === 'rowLevel',
    category:
      isReachedByRoles &&
      limitingPrincipal.type === 'agent' &&
      limitingPrincipal.role === 'rowLevel',
    region:
      isReachedByRoles &&
      applicationPrincipal.type === 'application' &&
      applicationPrincipal.role === 'rowLevel',
  };
};

export const findSqlContentViolations = (entries: SweepEntry[]) =>
  entries.flatMap((entry) => {
    if (typeof entry.sqlCondition !== 'object') {
      return [];
    }

    const { sql, parameters } = entry.sqlCondition;
    const label = describeSweepEntry(entry);
    const parameterValues = Object.values(parameters).map((value) =>
      JSON.stringify(value),
    );
    const isMissingParameter = (expected: unknown) =>
      !parameterValues.includes(JSON.stringify(expected));
    const reasons = new Set(
      SWEEP_RECORDS.map(
        (record) => decideRecordAccess({ ...entry, record }).reason,
      ),
    );
    const filterViolations = Object.entries(
      findFiltersHeldByPrincipals(entry.world),
    ).flatMap(([columnName, isHeld]) =>
      isHeld === sql.includes(`"${columnName}"`)
        ? []
        : [
            `${label}: ${columnName} filter ${isHeld ? 'missing' : 'unexpected'}`,
          ],
    );

    return [
      ...filterViolations,
      ...(reasons.has('share') &&
      (isMissingParameter(ACCESS_LEVELS_BY_OPERATION[entry.operationType]) ||
        !sql.includes('"accessLevel"'))
        ? [`${label}: share clause lacks its access levels`]
        : []),
      ...(reasons.has('creator') && isMissingParameter(MEMBER_ID)
        ? [`${label}: creator clause lacks the member`]
        : []),
    ];
  });

export const findEventDisagreements = (entries: SweepEntry[]) =>
  entries
    .filter(
      ({ readableEventRecordIds, grantedRecordIds }) =>
        isDefined(readableEventRecordIds) &&
        [...readableEventRecordIds].sort().join() !==
          [...grantedRecordIds].sort().join(),
    )
    .map(describeSweepEntry);

export const findRecordsHiddenFromObjectLevelAnswer = (
  entries: SweepEntry[],
) => {
  const recordById = new Map(
    SWEEP_RECORDS.map((record) => [record.id, record]),
  );

  return entries
    .filter(({ canReachSomeRecords }) => !canReachSomeRecords)
    .flatMap((entry) =>
      [...entry.grantedRecordIds]
        .filter((recordId) => {
          const record = recordById.get(recordId);

          return !(record?.isPrivate && record.createdBy === MEMBER_ID);
        })
        .map((recordId) => `${describeSweepEntry(entry)}: ${recordId}`),
    );
};
