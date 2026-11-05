import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  type ObjectRecordsOperationType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type RoleGrant = 'none' | 'rowLevel' | 'allRecords';

export type MatrixActor = {
  name: string;
  isWorkspaceMember: boolean;
  hasLimitingRole: boolean;
  hasAiRunScope: boolean;
};

export type MatrixRow = {
  id: string;
  isPrivate: boolean;
  isCreatedByActor: boolean;
  matchesMainRoleFilter: boolean;
  matchesLimitingRoleFilter: boolean;
  sharePrincipalId: string | undefined;
  shareAccessLevel: RecordShareAccessLevel | undefined;
};

export type MatrixScenario = {
  actor: MatrixActor;
  operationType: ObjectRecordsOperationType;
  isSharingEnabled: boolean;
  mainRoleGrant: RoleGrant;
  limitingRoleGrant: RoleGrant;
  row: MatrixRow;
};

export const WORKSPACE_MEMBER_ID = 'workspace-member-id';
export const OTHER_WORKSPACE_MEMBER_ID = 'other-workspace-member-id';
export const MAIN_ROLE_ID = 'main-role-id';
export const LIMITING_ROLE_ID = 'limiting-role-id';

export const ACCESS_LEVELS_BY_OPERATION: Record<
  ObjectRecordsOperationType,
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
  insert: [],
};

// Each flag is a point where the code differs from the stated rules: flip it once fixed
export type MatrixRules = {
  canEveryoneShareGrantAccess: boolean;
  shouldLimitingRoleBoundRecordGrants: boolean;
  canLimitingRoleShareReachActor: boolean;
};

export const STATED_RULES: MatrixRules = {
  canEveryoneShareGrantAccess: true,
  shouldLimitingRoleBoundRecordGrants: true,
  canLimitingRoleShareReachActor: false,
};

export const CURRENT_RULES: MatrixRules = {
  canEveryoneShareGrantAccess: false,
  shouldLimitingRoleBoundRecordGrants: false,
  canLimitingRoleShareReachActor: true,
};

const isShareHeldByActor = ({
  scenario: { actor, row },
  rules,
}: {
  scenario: Pick<MatrixScenario, 'actor' | 'row'>;
  rules: MatrixRules;
}): boolean =>
  (rules.canEveryoneShareGrantAccess &&
    row.sharePrincipalId === EVERYONE_PRINCIPAL_ID) ||
  row.sharePrincipalId === MAIN_ROLE_ID ||
  (actor.isWorkspaceMember && row.sharePrincipalId === WORKSPACE_MEMBER_ID) ||
  (rules.canLimitingRoleShareReachActor &&
    actor.hasLimitingRole &&
    row.sharePrincipalId === LIMITING_ROLE_ID);

export type MatrixDecision = {
  isGranted: boolean;
  reason:
    | 'no role reach'
    | 'limiting role denies'
    | 'role'
    | 'outside row level filter'
    | 'creator'
    | 'share'
    | 'no grant';
};

export const decideRecordAccess = ({
  scenario,
  rules = CURRENT_RULES,
}: {
  scenario: MatrixScenario;
  rules?: MatrixRules;
}): MatrixDecision => {
  const {
    actor,
    operationType,
    isSharingEnabled,
    mainRoleGrant,
    limitingRoleGrant,
    row,
  } = scenario;
  const roleGrants = actor.hasLimitingRole
    ? [mainRoleGrant, limitingRoleGrant]
    : [mainRoleGrant];
  const isReachedByRoles = roleGrants.every((grant) => grant !== 'none');
  const isSharedBeyondRole =
    isSharingEnabled &&
    !actor.hasAiRunScope &&
    (operationType === 'select' || operationType === 'update');

  if (!isReachedByRoles && !isSharedBeyondRole) {
    return { isGranted: false, reason: 'no role reach' };
  }

  if (
    rules.shouldLimitingRoleBoundRecordGrants &&
    actor.hasLimitingRole &&
    limitingRoleGrant === 'none'
  ) {
    return { isGranted: false, reason: 'limiting role denies' };
  }

  const isWithinRowLevelFilter =
    !isReachedByRoles ||
    ((mainRoleGrant !== 'rowLevel' || row.matchesMainRoleFilter) &&
      (!actor.hasLimitingRole ||
        limitingRoleGrant !== 'rowLevel' ||
        row.matchesLimitingRoleFilter));

  if (isReachedByRoles && isWithinRowLevelFilter && !row.isPrivate) {
    return { isGranted: true, reason: 'role' };
  }

  if (!isSharedBeyondRole && !isWithinRowLevelFilter) {
    return { isGranted: false, reason: 'outside row level filter' };
  }

  if (actor.isWorkspaceMember && row.isPrivate && row.isCreatedByActor) {
    return { isGranted: true, reason: 'creator' };
  }

  const isShareSufficient =
    isDefined(row.shareAccessLevel) &&
    ACCESS_LEVELS_BY_OPERATION[operationType].includes(row.shareAccessLevel) &&
    isShareHeldByActor({ scenario, rules });

  if (isShareSufficient && (isSharedBeyondRole || row.isPrivate)) {
    return { isGranted: true, reason: 'share' };
  }

  return { isGranted: false, reason: 'no grant' };
};
