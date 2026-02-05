import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/logic-function/constants/flat-logic-function-editable-properties.constant';
import { type UpdateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function.input';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow = ({
  updateLogicFunctionInput: rawUpdateLogicFunctionInput,
  flatLogicFunctionMaps,
}: {
  updateLogicFunctionInput: UpdateLogicFunctionInput;
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

  const update = rawUpdateLogicFunctionInput.update;
  const updatedEditableFieldProperties = {
    ...extractAndSanitizeObjectStringFields(
      {
        ...update,
        ...(isDefined(update.code) && {
          checksum: logicFunctionCreateHash(JSON.stringify(update.code)),
        }),
      },
      FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES,
    ),
    ...(isDefined(update.code) && { code: update.code }),
  };

  return mergeUpdateInExistingRecord({
    existing: existingFlatLogicFunctionToUpdate,
    properties: FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });
};
