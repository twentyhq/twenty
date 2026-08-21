import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';
import { buildJunctionTargetShape } from 'src/modules/timeline/utils/build-junction-target-shape.util';
import { buildManyToOneTargetShape } from 'src/modules/timeline/utils/build-many-to-one-target-shape.util';

// The relation shape matrix in one place, mirroring the flat rule validator:
// a junction one-to-many fans out through the junction object, a plain
// many-to-one lookup points at a single record, everything else carries no
// emission rule. Morph lookups wait on morph diff support.
export const buildRelationTargetShape = ({
  relationFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relationFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TimelineActivityRuleTargetShape | undefined => {
  const { settings } = relationFlatFieldMetadata;

  if (!isFieldMetadataSettingsOfType(settings, FieldMetadataType.RELATION)) {
    return undefined;
  }

  if (
    settings.relationType === RelationType.ONE_TO_MANY &&
    isDefined(settings.junctionTargetFieldId)
  ) {
    return buildJunctionTargetShape({
      relationFlatFieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  if (
    settings.relationType === RelationType.MANY_TO_ONE &&
    isFlatFieldMetadataOfType(
      relationFlatFieldMetadata,
      FieldMetadataType.RELATION,
    )
  ) {
    return buildManyToOneTargetShape({
      relationFlatFieldMetadata,
      flatObjectMetadataMaps,
    });
  }

  return undefined;
};
