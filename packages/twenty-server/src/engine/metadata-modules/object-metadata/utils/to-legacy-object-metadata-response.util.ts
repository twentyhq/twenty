import { type RestCursorPageInfo } from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
import { type ObjectMetadataWithFieldsDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata-with-fields.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const toLegacyObjectMetadataListResponse = ({
  data,
  pageInfo,
  totalCount,
}: {
  data: ObjectMetadataWithFieldsDTO[];
  pageInfo: RestCursorPageInfo;
  totalCount: number;
}) => ({
  data: { objects: data },
  pageInfo,
  totalCount,
});

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
