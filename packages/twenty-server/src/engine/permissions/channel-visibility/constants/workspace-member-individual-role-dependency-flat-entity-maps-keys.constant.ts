import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';
import { WORKSPACE_MEMBER_INDIVIDUAL_ROLE_METADATA_NAMES } from 'src/engine/permissions/channel-visibility/constants/workspace-member-individual-role-metadata-names.constant';

export const WORKSPACE_MEMBER_INDIVIDUAL_ROLE_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS =
  [
    ...new Set(
      WORKSPACE_MEMBER_INDIVIDUAL_ROLE_METADATA_NAMES.flatMap(
        (metadataName) => [
          metadataName,
          ...getMetadataRelatedMetadataNamesForValidation(metadataName),
        ],
      ),
    ),
  ].map(getMetadataFlatEntityMapsKey);
