import { OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';

export const buildVisibleToCallerSqlPredicate = ({
  rootMetadataName,
  tableAlias,
  userWorkspaceIdParameter,
}: {
  rootMetadataName: OwnableRootMetadataName;
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string => {
  const { visibilityProperty, workspaceVisibility, ownerProperty } =
    OWNABLE_METADATA_BY_ROOT_METADATA_NAME[rootMetadataName];

  return `(${tableAlias}."${visibilityProperty}" = '${workspaceVisibility}' OR ${tableAlias}."${ownerProperty}" = ${userWorkspaceIdParameter}::uuid)`;
};
