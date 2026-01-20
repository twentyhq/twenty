import {
  extractAndSanitizeObjectStringFields,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/serverless-function/constants/flat-serverless-function-editable-properties.constant';
import { type UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { findFlatServerlessFunctionOrThrow } from 'src/engine/metadata-modules/serverless-function/utils/find-flat-serverless-function-or-throw.util';
import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateServerlessFunctionInputToFlatServerlessFunctionToUpdateOrThrow =
  ({
    updateServerlessFunctionInput: rawUpdateServerlessFunctionInput,
    flatServerlessFunctionMaps,
  }: {
    updateServerlessFunctionInput: UpdateServerlessFunctionInput;
    flatServerlessFunctionMaps: MetadataFlatEntityMaps<'serverlessFunction'>;
  }): FlatServerlessFunction => {
    const { id: serverlessFunctionToUpdateId } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        rawUpdateServerlessFunctionInput,
        ['id'],
      );

    const existingFlatServerlessFunctionToUpdate =
      findFlatServerlessFunctionOrThrow({
        id: serverlessFunctionToUpdateId,
        flatServerlessFunctionMaps,
      });
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
