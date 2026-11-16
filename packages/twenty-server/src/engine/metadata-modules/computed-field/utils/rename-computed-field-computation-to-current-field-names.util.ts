import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { renameComputedFieldComputationFields } from 'src/engine/metadata-modules/computed-field/utils/rename-computed-field-computation-fields.util';

export const renameComputedFieldComputationToCurrentFieldNames = ({
  computation,
  flatFieldMetadataMaps,
}: {
  computation: FieldMetadataComputation;
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<Record<string, { name: string }>>;
  };
}): FieldMetadataComputation =>
  renameComputedFieldComputationFields({
    computation,
    fieldNameByUniversalIdentifier: new Map(
      Object.values(computation.bindings ?? {}).flatMap(
        (boundUniversalIdentifier) => {
          const boundField =
            flatFieldMetadataMaps.byUniversalIdentifier[
              boundUniversalIdentifier
            ];

          return isDefined(boundField)
            ? [[boundUniversalIdentifier, boundField.name] as const]
            : [];
        },
      ),
    ),
  });
