import { matchTranslatablePropertyPath } from './translatable-property-path';
import { NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from './translatable-properties-by-metadata-name';

const isNestedTranslatableMetadataName = (
  metadataName: string,
): metadataName is keyof typeof NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME =>
  metadataName in NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME;

export const findNestedTranslatablePropertyContext = ({
  metadataName,
  property,
}: {
  metadataName: string;
  property: string;
}): string | undefined => {
  if (!isNestedTranslatableMetadataName(metadataName)) {
    return undefined;
  }

  const contextByPattern: Record<string, string> =
    NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName];

  return Object.entries(contextByPattern).find(([pattern]) =>
    Array.isArray(matchTranslatablePropertyPath({ pattern, property })),
  )?.[1];
};
