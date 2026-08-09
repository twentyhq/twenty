import { type ObjectMetadataWithFieldsDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata-with-fields.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const toLegacyObjectMetadataFindOneResponse = (
  object: ObjectMetadataWithFieldsDTO,
) => ({ data: { object } });

export const toLegacyObjectMetadataCreateResponse = (
  object: ObjectMetadataWithFieldsDTO,
) => ({ data: { createOneObject: object } });

export const toLegacyObjectMetadataUpdateResponse = (
  object: ObjectMetadataWithFieldsDTO,
) => ({ data: { updateOneObject: object } });

export const toLegacyObjectMetadataDeleteResponse = (
  object: ObjectMetadataDTO,
) => ({ data: { deleteOneObject: object } });
