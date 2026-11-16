import { type FieldMetadataType } from 'twenty-shared/types';

import { type ComputedFieldToOneRelationHop } from 'src/engine/metadata-modules/computed-field/types/computed-field-to-one-relation-hop.type';

export type ComputedFieldPathResolution<TObject, TField> = {
  toOneRelationHops: ComputedFieldToOneRelationHop<TObject, TField>[];
  field: TField;
  columnName: string;
  columnType: FieldMetadataType;
};
