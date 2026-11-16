import { type ComputedFieldValueType } from 'src/engine/metadata-modules/computed-field/types/computed-field-value-type.type';
import { type SqlWithParameters } from 'src/engine/metadata-modules/computed-field/types/sql-with-parameters.type';

export type CompiledComputedFieldExpression = SqlWithParameters & {
  type: ComputedFieldValueType | undefined;
};
