import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

export function isFieldMetadataInterfaceOfType<
  Field extends FieldMetadataInterface<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FieldMetadataInterface<Type> {
  return fieldMetadata.type === type;
}

export function isFieldMetadataEntityOfType<
  Field extends FieldMetadataEntity<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FieldMetadataEntity<Type> {
  return fieldMetadata.type === type;
}

const field = getMockFieldMetadataEntity({
  type: FieldMetadataType.RELATION,
  objectMetadataId: '',
  workspaceId: '',
});

const tmp = isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION);
if (tmp) {
  // field should now be inferred as FieldMetadataEntity<FieldMetadataType.RELATION>
  field;
}
