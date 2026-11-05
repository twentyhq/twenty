import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataTechnicalNamesByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/types/metadata-technical-names-by-universal-identifier.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const applyStandardFieldJoinColumnNames = ({
  flatFieldMetadataMaps,
  technicalNamesByUniversalIdentifier,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  technicalNamesByUniversalIdentifier: MetadataTechnicalNamesByUniversalIdentifier;
}): FlatEntityMaps<FlatFieldMetadata> => {
  const byUniversalIdentifier = {
    ...flatFieldMetadataMaps.byUniversalIdentifier,
  };

  for (const fieldMetadata of Object.values(byUniversalIdentifier).filter(
    isDefined,
  )) {
    if (
      !isDefined(
        technicalNamesByUniversalIdentifier.fields[
          fieldMetadata.universalIdentifier
        ],
      ) ||
      !isMorphOrRelationFlatFieldMetadata(fieldMetadata) ||
      fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
    ) {
      continue;
    }

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: fieldMetadata.name,
    });

    byUniversalIdentifier[fieldMetadata.universalIdentifier] = {
      ...fieldMetadata,
      settings: { ...fieldMetadata.settings, joinColumnName },
      universalSettings: { ...fieldMetadata.universalSettings, joinColumnName },
    };
  }

  return { ...flatFieldMetadataMaps, byUniversalIdentifier };
};
