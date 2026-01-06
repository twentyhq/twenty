import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { findOrThrow } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { type SearchableFieldType } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';

type HandleLabelIdentifierChangesDuringFieldUpdateArgs = {
  flatObjectMetadata: FlatObjectMetadata;
} & FromTo<FlatFieldMetadata, 'flatFieldMetadata'> &
  Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;

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

  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldMetadataIds,
    });

  const searchVectorField = findOrThrow(
    objectFlatFieldMetadatas,
    (field) => field.name === SEARCH_VECTOR_FIELD.name,
    new FieldMetadataException(
      `Search vector field not found for object metadata ${flatObjectMetadata.id}`,
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    ),
  ) as FlatFieldMetadata<FieldMetadataType.TS_VECTOR>;

  try {
    const newAsExpression = getTsVectorColumnExpressionFromFields([
      {
        name: toFlatFieldMetadata.name,
        type: toFlatFieldMetadata.type as SearchableFieldType,
      },
    ]);

    return {
      ...searchVectorField,
      settings: {
        ...searchVectorField.settings,
        asExpression: newAsExpression,
      },
    };
  } catch {
    throw new FieldMetadataException(
      `Failed to compute search vector column expression for field ${toFlatFieldMetadata.name}`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
};
