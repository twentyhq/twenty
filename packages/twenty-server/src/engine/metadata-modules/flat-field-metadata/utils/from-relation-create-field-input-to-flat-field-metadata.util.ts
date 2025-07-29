import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateRelationCreationPayloadOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/validate-relation-creation-payload.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatFieldMetadataAndParentFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadata.util';
import {
  FlatObjectMetadata,
  FlatObjectMetadataWithoutFields,
} from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type RelationOrMorphFieldMetadataType =
  | FieldMetadataType.RELATION
  | FieldMetadataType.MORPH_RELATION;

export const fromRelationCreateFieldInputToFlatFieldMetadata = async ({
  existingFlatObjectMetadatas,
  parentFlatObjectMetadata,
  relationCreationPayload,
  fieldMetadataType,
  commonFlatFieldMetadata,
}: {
  fieldMetadataType: RelationOrMorphFieldMetadataType;
  relationCreationPayload: CreateFieldInput['relationCreationPayload'];
  existingFlatObjectMetadatas: FlatObjectMetadata[];
  parentFlatObjectMetadata: FlatObjectMetadata;
  commonFlatFieldMetadata: FlatFieldMetadata;
}): Promise<FlatFieldMetadataAndParentFlatObjectMetadata[]> => {
  if (!isDefined(relationCreationPayload)) {
    throw new FieldMetadataException(
      `Relation creation payload is required`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
  await validateRelationCreationPayloadOrThrow(relationCreationPayload);

  const objectMetadataTarget = existingFlatObjectMetadatas.find(
    (existingFlatObject) =>
      existingFlatObject.id === relationCreationPayload.targetObjectMetadataId,
  );

  if (!isDefined(objectMetadataTarget)) {
    throw new FieldMetadataException(
      `Object metadata relation target not found for relation creation payload`,
      FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
    );
  }

  return [
    {
      flatFieldMetadata: {
        ...commonFlatFieldMetadata,
        type: fieldMetadataType,
        defaultValue: null,
        settings: null,
        options: null,
        // TODO retrieve from objectMetadataMaps
        relationTargetFieldMetadataId: '',
        relationTargetObjectMetadataId: '',
        flatRelationTargetFieldMetadata: {} as FlatFieldMetadata,
        flatRelationTargetObjectMetadata: {} as FlatObjectMetadataWithoutFields,
        ///
      },
      parentFlatObjectMetadata,
    },
  ] satisfies FlatFieldMetadataAndParentFlatObjectMetadata<RelationOrMorphFieldMetadataType>[];
};
