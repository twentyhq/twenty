import {
  MESSAGE_TRANSLATABLE_MANIFEST_PROPERTIES,
  type MessageTranslatableManifestEntity,
} from './translatable-properties-by-metadata-name';

export const isMessageTranslatableManifestEntity = (
  entity: string,
): entity is MessageTranslatableManifestEntity =>
  Object.prototype.hasOwnProperty.call(
    MESSAGE_TRANSLATABLE_MANIFEST_PROPERTIES,
    entity,
  );
