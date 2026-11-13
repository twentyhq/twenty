import { PRIVACY_STATE_ACCESSOR_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/metadata-ownership/constants/privacy-state-accessor-by-root-metadata-name.constant';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { type OwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-privacy-state.type';
import { type OwnableRootRow } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-row.type';

export const resolveOwnableRootPrivacyState = ({
  rootMetadataName,
  row,
}: {
  rootMetadataName: OwnableRootMetadataName;
  row: OwnableRootRow;
}): OwnableRootPrivacyState =>
  PRIVACY_STATE_ACCESSOR_BY_ROOT_METADATA_NAME[rootMetadataName](row);
