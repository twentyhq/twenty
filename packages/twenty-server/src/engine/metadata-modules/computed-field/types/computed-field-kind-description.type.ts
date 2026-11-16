import {
  type ComputedFieldValueType,
  type FieldMetadataComputation,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { type ComputedFieldExpressionSlot } from 'src/engine/metadata-modules/computed-field/types/computed-field-expression-slot.type';

// `sourceRelationProperty`: where the name of the one-to-many relation read through lives; related records are its records
export type ComputedFieldKindDescription<
  TComputation extends FieldMetadataComputation = FieldMetadataComputation,
> = {
  readableShape: string;
  sourceRelationProperty?: string;
  expressionSlots: ComputedFieldExpressionSlot[];
  allowedValuesByProperty?: Record<string, readonly string[]>;
  // The rules slots cannot express. A method, so the description of one kind is usable where any kind is expected
  assertIsValidOrThrow(args: {
    computation: TComputation;
    fieldType: FieldMetadataType;
    valueTypeBySlotProperty: Record<string, ComputedFieldValueType | undefined>;
  }): void;
};
