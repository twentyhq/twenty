import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/serverless-function/constants/flat-serverless-function-editable-properties.constant';
import { type UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { serverlessFunctionCreateCodeChecksum } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-code-checksum.utils';
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
    const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
      {
        ...rawUpdateServerlessFunctionInput,
        checksum: serverlessFunctionCreateCodeChecksum(
          rawUpdateServerlessFunctionInput.code,
        ),
      },
      FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES,
    );

    return mergeUpdateInExistingRecord({
      existing: existingFlatServerlessFunctionToUpdate,
      properties: FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES,
      update: updatedEditableFieldProperties,
    });
  };
