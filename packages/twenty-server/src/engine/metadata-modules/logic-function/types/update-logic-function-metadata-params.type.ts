import { type FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/logic-function/constants/flat-logic-function-editable-properties.constant';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type UpdateLogicFunctionMetadataParams = Partial<
  Pick<
    FlatLogicFunction,
    (typeof FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES)[number]
  >
>;
