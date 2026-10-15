import {
  MANIFEST_TRANSLATABLE_PROPERTIES,
  type ManifestTranslatableEntity,
} from './translatable-properties-by-metadata-name';

export const isManifestTranslatableEntity = (
  entity: string,
): entity is ManifestTranslatableEntity =>
  Object.prototype.hasOwnProperty.call(
    MANIFEST_TRANSLATABLE_PROPERTIES,
    entity,
  );
