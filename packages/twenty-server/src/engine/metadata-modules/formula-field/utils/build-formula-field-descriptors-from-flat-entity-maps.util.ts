import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { buildFormulaFieldDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors.util';

export const buildFormulaFieldDescriptorsFromFlatEntityMaps = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ValidationRuleFieldDescriptor[] =>
  buildFormulaFieldDescriptors({
    flatFieldMetadatas: getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    ),
    getSettings: ({ settings }) => settings,
    findRelationTargetFlatFieldMetadatas: ({
      relationTargetObjectMetadataId,
    }) => {
      const targetFlatObjectMetadata = isDefined(relationTargetObjectMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      return isDefined(targetFlatObjectMetadata)
        ? getFlatFieldsFromFlatObjectMetadata(
            targetFlatObjectMetadata,
            flatFieldMetadataMaps,
          )
        : [];
    },
  });
