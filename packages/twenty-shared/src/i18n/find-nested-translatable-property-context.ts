import { matchTranslatablePropertyPath } from './translatable-property-path';
import { NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from './translatable-properties-by-metadata-name';

export const findNestedTranslatablePropertyContext = ({
  metadataName,
  property,
}: {
  metadataName: string;
  property: string;
}): string | undefined => {
  const contextByPattern: Record<string, string> =
    Object.entries(NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME).find(
      ([nestedMetadataName]) => nestedMetadataName === metadataName,
    )?.[1] ?? {};

  return Object.entries(contextByPattern).find(([pattern]) =>
    Array.isArray(matchTranslatablePropertyPath({ pattern, property })),
  )?.[1];
};
