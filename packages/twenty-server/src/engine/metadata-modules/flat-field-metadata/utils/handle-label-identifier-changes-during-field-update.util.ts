import { type FieldMetadataType } from 'twenty-shared/types';
import { findOrThrow, isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { isSearchableFieldType } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';

type HandleLabelIdentifierChangesDuringFieldUpdateArgs = {
  fromFlatFieldMetadata: FlatFieldMetadata;
  toFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;

export const handleLabelIdentifierChangesDuringFieldUpdate = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: HandleLabelIdentifierChangesDuringFieldUpdateArgs):
  | FlatFieldMetadata<FieldMetadataType.TS_VECTOR>
  | undefined => {
  const hasNameChanged =
    fromFlatFieldMetadata.name !== toFlatFieldMetadata.name;

  if (!hasNameChanged) {
    return undefined;
  }

  if (!isSearchableFieldType(toFlatFieldMetadata.type)) {
    return undefined;
  }

  if (!isDefined(flatObjectMetadata.fieldMetadataIds)) {
    return undefined;
  }

  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldMetadataIds,
    });

  const searchVectorField = findOrThrow(
    objectFlatFieldMetadatas,
    (field) => field.name === SEARCH_VECTOR_FIELD.name,
  ) as FlatFieldMetadata<FieldMetadataType.TS_VECTOR>;

  const newAsExpression = getTsVectorColumnExpressionFromFields([
    {
      name: toFlatFieldMetadata.name,
      type: toFlatFieldMetadata.type,
    },
  ]);

  return {
    ...searchVectorField,
    settings: {
      ...searchVectorField.settings,
      asExpression: newAsExpression,
      generatedType: 'STORED',
    },
  };
};
