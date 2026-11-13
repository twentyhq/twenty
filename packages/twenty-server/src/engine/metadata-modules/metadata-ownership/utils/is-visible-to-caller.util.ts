import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { type OwnableRootRow } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-row.type';
import { isPrivateRowVisibleToCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-private-row-visible-to-caller.util';
import { resolveOwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/utils/resolve-ownable-root-privacy-state.util';

export const isVisibleToCaller = ({
  rootMetadataName,
  row,
  caller,
}: {
  rootMetadataName: OwnableRootMetadataName;
  row: OwnableRootRow;
  caller: MetadataCaller;
}): boolean => {
  if (caller.type === 'bypassesPrivacy') {
    return true;
  }

  const { isPrivate, ownerUserWorkspaceId } = resolveOwnableRootPrivacyState({
    rootMetadataName,
    row,
  });

  return (
    !isPrivate || isPrivateRowVisibleToCaller({ ownerUserWorkspaceId, caller })
  );
};
