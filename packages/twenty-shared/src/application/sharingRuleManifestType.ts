import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type RowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionPredicateManifest,
} from '@/application/roleManifestType';
import {
  type RecordShareAccessLevel,
  type RecordSharePrincipalType,
} from '@/types';

export type SharingRuleManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  name: string;
  description?: string;
  granteePrincipalType: RecordSharePrincipalType;
  granteeRoleUniversalIdentifier?: string;
  granteePrincipalId?: string;
  accessLevel: RecordShareAccessLevel;
  isActive?: boolean;
  rowLevelPermissionPredicates?: RowLevelPermissionPredicateManifest[];
  rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupManifest[];
};
