import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { VIEW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES } from 'src/engine/metadata-modules/metadata-ownership/constants/view-ownership-index-source-key-names.constant';
import { WORKFLOW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES } from 'src/engine/metadata-modules/metadata-ownership/constants/workflow-ownership-index-source-key-names.constant';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';

export const OWNERSHIP_INDEX_SOURCE_KEY_NAMES_BY_ROOT_METADATA_NAME = {
  view: VIEW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES,
  workflow: WORKFLOW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES,
} as const satisfies Record<
  OwnableRootMetadataName,
  readonly (keyof AllFlatEntityMaps)[]
>;
