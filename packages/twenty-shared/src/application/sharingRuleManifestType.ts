import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type RowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionPredicateManifest,
} from '@/application/roleManifestType';
import {
  type RecordSharePrincipalType,
  type SharingRuleAccessLevel,
} from '@/types';

export type SharingRuleManifestGranteePrincipalType =
  | RecordSharePrincipalType.EVERYONE
  | RecordSharePrincipalType.ROLE;

export type SharingRuleManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  name: string;
  description?: string;
  granteePrincipalType: SharingRuleManifestGranteePrincipalType;
  granteeRoleUniversalIdentifier?: string;
  accessLevel: SharingRuleAccessLevel;
  isActive?: boolean;
  rowLevelPermissionPredicates?: RowLevelPermissionPredicateManifest[];
  rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupManifest[];
};
