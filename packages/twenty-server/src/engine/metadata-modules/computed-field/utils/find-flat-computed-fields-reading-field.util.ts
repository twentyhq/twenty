import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const findFlatComputedFieldsReadingField = <
  TField extends { computation: FieldMetadataComputation | null },
>({
  fieldUniversalIdentifiers,
  flatFieldMetadataMaps,
}: {
  fieldUniversalIdentifiers: string[];
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<Record<string, TField>>;
  };
}): TField[] =>
  Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(({ computation }) =>
      Object.values(computation?.bindings ?? {}).some(
        (boundUniversalIdentifier) =>
          fieldUniversalIdentifiers.includes(boundUniversalIdentifier),
      ),
    );
