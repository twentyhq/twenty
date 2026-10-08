import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getRelationFlatFieldMetadatasOfObject = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): OrmFlatFieldMetadata<MorphOrRelationFieldMetadataType>[] => {
  const flatFieldMetadatas =
    flatObjectMetadata.fieldIds.length > 0
      ? getFlatFieldsFromFlatObjectMetadata(
          flatObjectMetadata,
          flatFieldMetadataMaps,
        )
      : Object.values(flatFieldMetadataMaps.byUniversalIdentifier);

  return flatFieldMetadatas.filter(
    (
      flatFieldMetadata,
    ): flatFieldMetadata is OrmFlatFieldMetadata<MorphOrRelationFieldMetadataType> =>
      isDefined(flatFieldMetadata) &&
      flatFieldMetadata.objectMetadataId === flatObjectMetadata.id &&
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadata),
  );
};
