import {
  PRIVACY_STATE_SQL_ACCESSOR_BY_ROOT_METADATA_NAME,
  type SqlReadablePrivacyRootMetadataName,
} from 'src/engine/metadata-modules/metadata-ownership/constants/privacy-state-sql-accessor-by-root-metadata-name.constant';
import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';

export type VisibleToCallerSqlPredicate = {
  sql: string;
  userWorkspaceId: string | null;
};

export const buildVisibleToCallerSqlPredicate = ({
  rootMetadataName,
  tableAlias,
  userWorkspaceIdParameter,
  caller,
}: {
  rootMetadataName: SqlReadablePrivacyRootMetadataName;
  tableAlias: string;
  userWorkspaceIdParameter: string;
  caller: MetadataCaller;
}): VisibleToCallerSqlPredicate | undefined => {
  if (caller.type === 'bypassesPrivacy') {
    return undefined;
  }

  const { isPrivateSql, ownerUserWorkspaceIdSql } =
    PRIVACY_STATE_SQL_ACCESSOR_BY_ROOT_METADATA_NAME[rootMetadataName]({
      tableAlias,
    });

  return {
    sql: `(NOT (${isPrivateSql}) OR ${ownerUserWorkspaceIdSql} = ${userWorkspaceIdParameter}::uuid)`,
    userWorkspaceId:
      caller.type === 'workspaceMember' ? caller.userWorkspaceId : null,
  };
};
