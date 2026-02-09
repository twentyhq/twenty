import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/logic-function/constants/flat-logic-function-editable-properties.constant';
import { type UpdateLogicFunctionSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function.input';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow = ({
  updateLogicFunctionInput: rawUpdateLogicFunctionInput,
  flatLogicFunctionMaps,
}: {
  updateLogicFunctionInput: UpdateLogicFunctionSourceInput;
  flatLogicFunctionMaps: MetadataFlatEntityMaps<'logicFunction'>;
}): FlatLogicFunction => {
  const { id: logicFunctionToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateLogicFunctionInput,
      ['id'],
    );

  const existingFlatLogicFunctionToUpdate = findFlatLogicFunctionOrThrow({
    id: logicFunctionToUpdateId,
    flatLogicFunctionMaps,
  });

  return mergeUpdateInExistingRecord({
    existing: existingFlatLogicFunctionToUpdate,
    properties: FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES,
    update: rawUpdateLogicFunctionInput.update,
  });
};
