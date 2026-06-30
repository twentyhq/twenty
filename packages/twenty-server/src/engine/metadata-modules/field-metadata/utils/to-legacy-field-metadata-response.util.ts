import { type RestCursorPageInfo } from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const toLegacyFieldMetadataListResponse = ({
  data,
  pageInfo,
  totalCount,
}: {
  data: FieldMetadataDTO[];
  pageInfo: RestCursorPageInfo;
  totalCount: number;
}) => ({
  data: { fields: data },
  pageInfo,
  totalCount,
});

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
