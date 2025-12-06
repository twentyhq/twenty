import { type EntityManager } from 'typeorm';

import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import {
  isSearchableFieldType,
  type SearchableFieldType,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';

export const getSearchFieldsFromMetadata = async (
  manager: EntityManager,
  workspaceId: string,
  objectMetadataId: string,
): Promise<FieldTypeAndNameMetadata[]> => {
  const searchFieldMetadataRepository = manager.getRepository(
    SearchFieldMetadataEntity,
  );

  const searchFieldMetadataEntries = await searchFieldMetadataRepository.find({
    where: {
      workspaceId,
      objectMetadataId,
    },
    relations: ['fieldMetadata'],
  });

  if (searchFieldMetadataEntries.length === 0) {
    return [];
  }

  const fieldTypeAndNameMetadata: FieldTypeAndNameMetadata[] = [];

  for (const entry of searchFieldMetadataEntries) {
    const fieldMetadata = entry.fieldMetadata;

    if (!fieldMetadata) {
      continue;
    }

    // Only include fields that are of a searchable type
    if (isSearchableFieldType(fieldMetadata.type)) {
      fieldTypeAndNameMetadata.push({
        name: fieldMetadata.name,
        type: fieldMetadata.type as SearchableFieldType,
      });
    }
  }

  return fieldTypeAndNameMetadata;
};

export const getSearchVectorExpressionFromMetadata = async (
  manager: EntityManager,
  workspaceId: string,
  objectMetadataId: string,
): Promise<string | null> => {
  const searchFields = await getSearchFieldsFromMetadata(
    manager,
    workspaceId,
    objectMetadataId,
  );

  if (searchFields.length === 0) {
    return null;
  }

  return getTsVectorColumnExpressionFromFields(searchFields);
};
