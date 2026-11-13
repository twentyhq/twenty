import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { type OwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-privacy-state.type';
import { type OwnableRootRow } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-row.type';
import { resolveViewPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/utils/resolve-view-privacy-state.util';
import { resolveWorkflowPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/utils/resolve-workflow-privacy-state.util';

export const PRIVACY_STATE_ACCESSOR_BY_ROOT_METADATA_NAME = {
  view: resolveViewPrivacyState,
  workflow: resolveWorkflowPrivacyState,
} as const satisfies Record<
  OwnableRootMetadataName,
  (row: OwnableRootRow) => OwnableRootPrivacyState
>;
