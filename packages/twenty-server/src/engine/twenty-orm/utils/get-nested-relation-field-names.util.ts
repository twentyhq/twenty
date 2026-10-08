import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getNestedRelationFieldNames = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ReadonlySet<string> =>
  new Set(
    getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    )
      .filter(
        (field) =>
          (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
            isFlatFieldMetadataOfType(
              field,
              FieldMetadataType.MORPH_RELATION,
            )) &&
          field.settings.relationType === RelationType.MANY_TO_ONE,
      )
      .map(({ name }) => name),
  );
