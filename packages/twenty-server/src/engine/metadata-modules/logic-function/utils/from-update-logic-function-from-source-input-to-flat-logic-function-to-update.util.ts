import { isDefined } from 'twenty-shared/utils';

import { FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/logic-function/constants/flat-logic-function-editable-properties.constant';
import { type UpdateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-from-source.input';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateLogicFunctionFromSourceInputToFlatLogicFunctionToUpdate =
  ({
    updateLogicFunctionFromSourceInput,
    existingFlatLogicFunction,
  }: {
    updateLogicFunctionFromSourceInput: UpdateLogicFunctionFromSourceInput;
    existingFlatLogicFunction: FlatLogicFunction;
  }): FlatLogicFunction => {
    const { sourceHandlerCode, ...metadataUpdates } =
      updateLogicFunctionFromSourceInput.update;

    return {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatLogicFunction,
        properties: [...FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES],
        update: {
          ...metadataUpdates,
          ...(isDefined(sourceHandlerCode) ? { isBuildUpToDate: false } : {}),
        },
      }),
      updatedAt: new Date().toISOString(),
    };
  };
