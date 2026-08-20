import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationFlatFieldMetadata } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-flat-field-metadata.util';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule.type';

type BuildManyToOneTargetShapeArgs = {
  relationFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

// A many-to-one relation is a lookup on the rule object: its join column points
// at the single record whose timeline receives the entries.
export const buildManyToOneTargetShape = ({
  relationFlatFieldMetadata,
  flatObjectMetadataMaps,
}: BuildManyToOneTargetShapeArgs):
  | TimelineActivityRuleTargetShape
  | undefined => {
  const { settings } = relationFlatFieldMetadata;

  if (!isFieldMetadataSettingsOfType(settings, FieldMetadataType.RELATION)) {
    return undefined;
  }

  if (settings.relationType !== RelationType.MANY_TO_ONE) {
    return undefined;
  }

  const { relationTargetObjectMetadataId } = relationFlatFieldMetadata;

  if (!isDefined(relationTargetObjectMetadataId)) {
    return undefined;
  }

  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(targetFlatObjectMetadata)) {
    return undefined;
  }

  return {
    kind: 'MANY_TO_ONE',
    relationFieldName: relationFlatFieldMetadata.name,
    targetJoinColumn: {
      joinColumnName: getJoinColumnNameForRelationFlatFieldMetadata(
        relationFlatFieldMetadata,
      ),
      targetObjectNameSingular: targetFlatObjectMetadata.nameSingular,
    },
  };
};
