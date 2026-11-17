import { type ComputedFieldValueType } from 'twenty-shared/types';
import { type SqlWithParameters } from 'src/engine/metadata-modules/computed-field/types/sql-with-parameters.type';

export type CompiledComputedFieldExpression = SqlWithParameters & {
  type: ComputedFieldValueType | undefined;
};
