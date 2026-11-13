import { WorkflowVisibility } from 'twenty-shared/types';

import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { type OwnableRootPrivacyStateSql } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-privacy-state-sql.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const PRIVACY_STATE_SQL_ACCESSOR_BY_ROOT_METADATA_NAME = {
  workflow: ({
    tableAlias,
  }: {
    tableAlias: string;
  }): OwnableRootPrivacyStateSql => ({
    isPrivateSql: `${escapeIdentifier(tableAlias)}.${escapeIdentifier('visibility')} <> '${WorkflowVisibility.WORKSPACE}'`,
    ownerUserWorkspaceIdSql: `${escapeIdentifier(tableAlias)}.${escapeIdentifier('createdByUserWorkspaceId')}`,
  }),
} as const satisfies Partial<
  Record<
    OwnableRootMetadataName,
    (args: { tableAlias: string }) => OwnableRootPrivacyStateSql
  >
>;

export type SqlReadablePrivacyRootMetadataName =
  keyof typeof PRIVACY_STATE_SQL_ACCESSOR_BY_ROOT_METADATA_NAME;
