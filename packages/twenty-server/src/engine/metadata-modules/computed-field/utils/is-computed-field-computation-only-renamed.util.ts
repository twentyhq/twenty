import isEqual from 'lodash.isequal';
import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import { renameComputedFieldComputationFields } from 'src/engine/metadata-modules/computed-field/utils/rename-computed-field-computation-fields.util';

// True when the computation is the existing one written with the current names of the fields it is bound to
export const isComputedFieldComputationOnlyRenamed = ({
  existingComputation,
  computation,
  flatFieldMetadataMaps,
}: {
  existingComputation: FieldMetadataComputation;
  computation: FieldMetadataComputation;
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<Record<string, { name: string }>>;
  };
}): boolean => {
  const fieldNameByUniversalIdentifier = new Map(
    Object.values(existingComputation.bindings ?? {}).flatMap(
      (boundUniversalIdentifier) => {
        const boundField =
          flatFieldMetadataMaps.byUniversalIdentifier[boundUniversalIdentifier];

        return isDefined(boundField)
          ? [[boundUniversalIdentifier, boundField.name] as const]
          : [];
      },
    ),
  );

  return isEqual(
    removePropertiesFromRecord(
      renameComputedFieldComputationFields({
        computation: existingComputation,
        fieldNameByUniversalIdentifier,
      }),
      ['bindings'],
    ),
    removePropertiesFromRecord(computation, ['bindings']),
  );
};
