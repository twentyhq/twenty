import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  findHeldRoles,
  type GivenPrincipals,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  type RecordAccessScenario,
  type RoleGrant,
} from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import { type RecordOperation } from 'src/engine/permissions/__tests__/framework/record-operations.constant';
import {
  APPLICATION_ROLE_ID,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  MEMBER_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { type StoredRecordFixture } from 'src/engine/permissions/__tests__/framework/stored-records.util';

export const ACCESS_LEVELS_BY_OPERATION: Record<
  RecordOperation,
  RecordShareAccessLevel[]
> = {
  select: [
    RecordShareAccessLevel.READ,
    RecordShareAccessLevel.READ_WRITE,
    RecordShareAccessLevel.FULL,
  ],
  update: [RecordShareAccessLevel.READ_WRITE, RecordShareAccessLevel.FULL],
  'soft-delete': [RecordShareAccessLevel.FULL],
  restore: [RecordShareAccessLevel.FULL],
  delete: [RecordShareAccessLevel.FULL],
};

export type RecordAccessReason =
  | 'no role reach'
  | 'role'
  | 'outside row level filter'
  | 'creator'
  | 'share'
  | 'no grant';

// Matches the code, including what cases/known-differences.spec.ts says should change
const findShareKeys = ({
  mainPrincipal,
  limitingPrincipal,
  applicationPrincipal,
}: GivenPrincipals<RoleGrant>) => [
  MAIN_ROLE_ID,
  ...(mainPrincipal.type === 'workspaceMember' ? [MEMBER_ID] : []),
  ...(limitingPrincipal.type === 'agent' ? [LIMITING_ROLE_ID] : []),
  ...(applicationPrincipal.type === 'application' ? [APPLICATION_ROLE_ID] : []),
];

export const decideRecordAccess = ({
  scenario,
  operationType,
  record,
}: {
  scenario: RecordAccessScenario;
  operationType: RecordOperation;
  record: StoredRecordFixture;
}): { isGranted: boolean; reason: RecordAccessReason } => {
  const { mainPrincipal, limitingPrincipal, applicationPrincipal } = scenario;
  const isReachedByRoles = findHeldRoles(scenario).every(
    (grant) => grant !== 'none',
  );
  const isSharedBeyondRole =
    scenario.isSharingEnabled &&
    !isDefined(scenario.aiRunScope) &&
    (operationType === 'select' || operationType === 'update');

  if (!isReachedByRoles && !isSharedBeyondRole) {
    return { isGranted: false, reason: 'no role reach' };
  }

  const isOutsideFilter =
    isReachedByRoles &&
    ((mainPrincipal.role === 'rowLevel' &&
      record.outsideFilterOf?.includes('mainPrincipal')) ||
      (limitingPrincipal.type === 'agent' &&
        limitingPrincipal.role === 'rowLevel' &&
        record.outsideFilterOf?.includes('limitingPrincipal')) ||
      (applicationPrincipal.type === 'application' &&
        applicationPrincipal.role === 'rowLevel' &&
        record.outsideFilterOf?.includes('applicationPrincipal')));

  if (isReachedByRoles && !isOutsideFilter && !record.isPrivate) {
    return { isGranted: true, reason: 'role' };
  }

  if (!isSharedBeyondRole && isOutsideFilter) {
    return { isGranted: false, reason: 'outside row level filter' };
  }

  if (
    mainPrincipal.type === 'workspaceMember' &&
    record.isPrivate &&
    record.createdBy === MEMBER_ID
  ) {
    return { isGranted: true, reason: 'creator' };
  }

  const isShareSufficient =
    isDefined(record.share) &&
    ACCESS_LEVELS_BY_OPERATION[operationType].includes(
      record.share.accessLevel,
    ) &&
    findShareKeys(scenario).includes(record.share.principalId);

  if (isShareSufficient && (isSharedBeyondRole || record.isPrivate)) {
    return { isGranted: true, reason: 'share' };
  }

  return { isGranted: false, reason: 'no grant' };
};
