import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const toLegacyFieldMetadataFindOneResponse = (
  field: FieldMetadataDTO,
) => ({ data: { field } });

export const toLegacyFieldMetadataCreateResponse = (
  field: FieldMetadataDTO,
) => ({ data: { createOneField: field } });

export const toLegacyFieldMetadataUpdateResponse = (
  field: FieldMetadataDTO,
) => ({ data: { updateOneField: field } });

export const toLegacyFieldMetadataDeleteResponse = (
  field: FieldMetadataDTO,
) => ({ data: { deleteOneField: field } });
