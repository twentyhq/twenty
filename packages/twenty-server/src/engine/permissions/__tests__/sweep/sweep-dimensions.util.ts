import { RecordShareAccessLevel } from 'twenty-shared/types';

import {
  type RecordAccessScenario,
  type RoleGrant,
} from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import { buildReachablePrincipals } from 'src/engine/permissions/__tests__/sweep/reachable-principals.util';
import { type PrincipalSlot } from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  APPLICATION_ROLE_ID,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  MEMBER_ID,
  OTHER_MEMBER_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import {
  EVERYONE,
  type StoredRecordFixture,
} from 'src/engine/permissions/__tests__/framework/stored-records.util';

const ROLE_GRANTS: RoleGrant[] = ['none', 'rowLevel', 'allRecords'];
const FLAGS = [true, false];
const SHARE_TARGETS = [
  MEMBER_ID,
  OTHER_MEMBER_ID,
  MAIN_ROLE_ID,
  LIMITING_ROLE_ID,
  APPLICATION_ROLE_ID,
  EVERYONE,
];

export const SWEEP_SCENARIOS: RecordAccessScenario[] = buildReachablePrincipals(
  {
    roles: ROLE_GRANTS,
  },
).flatMap((principals) =>
  FLAGS.flatMap((isSharingEnabled) => [
    { ...principals, isSharingEnabled },
    ...(principals.mainPrincipal.type === 'workspaceMember'
      ? [{ ...principals, isSharingEnabled, aiRunScope: 'allRecords' as const }]
      : []),
  ]),
);

const SHARES = [
  undefined,
  ...SHARE_TARGETS.flatMap((principalId) =>
    Object.values(RecordShareAccessLevel).map((accessLevel) => ({
      principalId,
      accessLevel,
    })),
  ),
];

const OUTSIDE_FILTER_COMBINATIONS: PrincipalSlot[][] = FLAGS.flatMap((isMain) =>
  FLAGS.flatMap((isLimiting) =>
    FLAGS.map((isApplication) => [
      ...(isMain ? ['mainPrincipal' as const] : []),
      ...(isLimiting ? ['limitingPrincipal' as const] : []),
      ...(isApplication ? ['applicationPrincipal' as const] : []),
    ]),
  ),
);

// Lowercase because the event path lowercases record ids
const toRecordId = (record: Omit<StoredRecordFixture, 'id'>) =>
  [
    record.isPrivate ? 'private' : 'public',
    record.createdBy === MEMBER_ID ? 'mine' : 'theirs',
    `outside-${record.outsideFilterOf?.join('-') || 'none'}`,
    record.share?.principalId ?? 'unshared',
    record.share?.accessLevel ?? 'none',
  ]
    .join('-')
    .toLowerCase();

export const SWEEP_RECORDS: StoredRecordFixture[] = FLAGS.flatMap((isPrivate) =>
  [MEMBER_ID, OTHER_MEMBER_ID].flatMap((createdBy) =>
    OUTSIDE_FILTER_COMBINATIONS.flatMap((outsideFilterOf) =>
      SHARES.map((share) => {
        const record = { isPrivate, createdBy, outsideFilterOf, share };

        return { ...record, id: toRecordId(record) };
      }),
    ),
  ),
);
