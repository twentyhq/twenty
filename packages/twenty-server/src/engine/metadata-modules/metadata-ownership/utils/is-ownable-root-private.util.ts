import { OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';

export const isOwnableRootPrivate = ({
  rootMetadataName,
  row,
}: {
  rootMetadataName: OwnableRootMetadataName;
  row: Record<string, unknown>;
}): boolean => {
  const { visibilityProperty, workspaceVisibility } =
    OWNABLE_METADATA_BY_ROOT_METADATA_NAME[rootMetadataName];

  return row[visibilityProperty] !== workspaceVisibility;
};
