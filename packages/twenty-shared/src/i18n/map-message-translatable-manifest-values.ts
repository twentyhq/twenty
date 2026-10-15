import { mapTranslatablePropertyPathValues } from './translatable-property-path';
import {
  MESSAGE_TRANSLATABLE_MANIFEST_PROPERTIES,
  type MessageTranslatableManifestEntity,
} from './translatable-properties-by-metadata-name';

export const mapMessageTranslatableManifestValues = <
  TValue,
  TMappedValue = TValue,
>({
  entity,
  value,
  mapValue,
}: {
  entity: MessageTranslatableManifestEntity;
  value: TValue;
  mapValue: ({
    value,
    context,
  }: {
    value: unknown;
    context: string;
  }) => unknown;
}): TMappedValue =>
  Object.entries(
    MESSAGE_TRANSLATABLE_MANIFEST_PROPERTIES[entity],
  ).reduce<unknown>(
    (mappedValue, [pattern, context]) =>
      mapTranslatablePropertyPathValues({
        pattern,
        value: mappedValue,
        mapValue: (leafValue) => mapValue({ value: leafValue, context }),
      }),
    value,
  ) as TMappedValue;
