import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/serverless-function/constants/flat-serverless-function-editable-properties.constant';
import { type UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateServerlessFunctionInputToFlatServerlessFunctionToUpdateOrThrow =
  ({
    updateServerlessFunctionInput: rawUpdateServerlessFunctionInput,
    flatServerlessFunctionMaps,
  }: {
    updateServerlessFunctionInput: UpdateServerlessFunctionInput;
    flatServerlessFunctionMaps: FlatEntityMaps<FlatServerlessFunction>;
  }): FlatServerlessFunction => {
    const { id: serverlessFunctionToUpdateId } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        rawUpdateServerlessFunctionInput,
        ['id'],
      );

    const existingFlatServerlessFunctionToUpdate =
      flatServerlessFunctionMaps.byId[serverlessFunctionToUpdateId];

    if (!isDefined(existingFlatServerlessFunctionToUpdate)) {
      throw new ServerlessFunctionException(
        t`Serverless function to update not found`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }
    const updatedEditableFieldProperties = {
      ...extractAndSanitizeObjectStringFields(
        {
          ...rawUpdateServerlessFunctionInput.update,
          checksum: serverlessFunctionCreateHash(
            JSON.stringify(rawUpdateServerlessFunctionInput.update.code),
          ),
        },
        FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES,
      ),
      code: rawUpdateServerlessFunctionInput.update.code,
    };

    return mergeUpdateInExistingRecord({
      existing: existingFlatServerlessFunctionToUpdate,
      properties: FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES,
      update: updatedEditableFieldProperties,
    });
  };
