import { isDefined } from 'twenty-shared/utils';

import { FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/logic-function/constants/flat-logic-function-editable-properties.constant';
import { type UpdateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-from-source.input';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateLogicFunctionFromSourceInputToFlatLogicFunctionToUpdateOrThrow =
  ({
    updateLogicFunctionFromSourceInput,
    flatLogicFunctionMaps,
  }: {
    updateLogicFunctionFromSourceInput: UpdateLogicFunctionFromSourceInput;
    flatLogicFunctionMaps: MetadataFlatEntityMaps<'logicFunction'>;
  }): FlatLogicFunction => {
    const existingFlatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updateLogicFunctionFromSourceInput.id,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    if (
      !isDefined(existingFlatLogicFunction) ||
      isDefined(existingFlatLogicFunction.deletedAt)
    ) {
      throw new LogicFunctionException(
        `Logic function with id ${updateLogicFunctionFromSourceInput.id} not found`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const { sourceHandlerCode: _sourceHandlerCode, ...metadataUpdates } =
      updateLogicFunctionFromSourceInput.update;

    const hasSourceCodeUpdate = isDefined(
      updateLogicFunctionFromSourceInput.update.sourceHandlerCode,
    );

    return {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatLogicFunction,
        properties: [...FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES],
        update: {
          ...metadataUpdates,
          ...(hasSourceCodeUpdate ? { isBuildUpToDate: false } : {}),
        },
      }),
      updatedAt: new Date().toISOString(),
    };
  };
