import { mapTranslatablePropertyPathValues } from './translatable-property-path';
import {
  MANIFEST_TRANSLATABLE_PROPERTIES,
  type ManifestTranslatableEntity,
} from './translatable-properties-by-metadata-name';

export const mapManifestTranslatableValues = <TValue, TMappedValue = TValue>({
  entity,
  value,
  mapValue,
}: {
  entity: ManifestTranslatableEntity;
  value: TValue;
  mapValue: ({
    value,
    context,
  }: {
    value: unknown;
    context: string;
  }) => unknown;
}): TMappedValue =>
  Object.entries(MANIFEST_TRANSLATABLE_PROPERTIES[entity]).reduce<unknown>(
    (mappedValue, [pattern, context]) =>
      mapTranslatablePropertyPathValues({
        pattern,
        value: mappedValue,
        mapValue: (leafValue) => mapValue({ value: leafValue, context }),
      }),
    value,
  ) as TMappedValue;
