import { mapManifestTranslatableValues } from './map-manifest-translatable-values';
import { type ManifestTranslatableEntity } from './translatable-properties-by-metadata-name';

export const listManifestTranslatableValues = ({
  entity,
  value,
}: {
  entity: ManifestTranslatableEntity;
  value: unknown;
}): { value: unknown; context: string }[] => {
  const translatableValues: { value: unknown; context: string }[] = [];

  mapManifestTranslatableValues({
    entity,
    value,
    mapValue: (translatableValue) => {
      translatableValues.push(translatableValue);

      return translatableValue.value;
    },
  });

  return translatableValues;
};
