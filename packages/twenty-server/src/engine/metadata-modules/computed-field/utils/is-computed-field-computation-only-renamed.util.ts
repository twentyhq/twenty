import isEqual from 'lodash.isequal';
import { type FieldMetadataComputation } from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { renameComputedFieldComputationToCurrentFieldNames } from 'src/engine/metadata-modules/computed-field/utils/rename-computed-field-computation-to-current-field-names.util';

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
}): boolean =>
  isEqual(
    removePropertiesFromRecord(
      renameComputedFieldComputationToCurrentFieldNames({
        computation: existingComputation,
        flatFieldMetadataMaps,
      }),
      ['bindings'],
    ),
    removePropertiesFromRecord(computation, ['bindings']),
  );
