import { type ComputedFieldSchemaField } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-field.type';

export type ComputedFieldBindableSchemaField = ComputedFieldSchemaField & {
  universalIdentifier: string;
};
