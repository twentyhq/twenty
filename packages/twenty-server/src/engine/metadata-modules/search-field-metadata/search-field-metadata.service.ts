import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import {
  isSearchableFieldType,
  type SearchableFieldType,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';

@Injectable()
export class SearchFieldMetadataService {
  constructor(
    @InjectRepository(SearchFieldMetadataEntity)
    private readonly searchFieldMetadataRepository: Repository<SearchFieldMetadataEntity>,
  ) {}

  async getSearchableFields(
    objectMetadataId: string,
  ): Promise<FieldTypeAndNameMetadata[]> {
    const searchFieldMetadata = await this.searchFieldMetadataRepository.find({
      where: { objectMetadataId },
      relations: ['fieldMetadata'],
    });

    return searchFieldMetadata
      .filter((searchField) =>
        isSearchableFieldType(searchField.fieldMetadata.type),
      )
      .map((searchField) => ({
        name: searchField.fieldMetadata.name,
        type: searchField.fieldMetadata.type as SearchableFieldType,
      }));
  }

  async isFieldSearchable(
    objectMetadataId: string,
    fieldMetadataId: string,
  ): Promise<boolean> {
    const exists = await this.searchFieldMetadataRepository.exists({
      where: { objectMetadataId, fieldMetadataId },
    });

    return exists;
  }

  async setFieldSearchable(
    objectMetadataId: string,
    fieldMetadataId: string,
    workspaceId: string,
  ): Promise<SearchFieldMetadataEntity> {
    const existing = await this.searchFieldMetadataRepository.findOne({
      where: { objectMetadataId, fieldMetadataId },
    });

    if (existing) {
      return existing;
    }

    return await this.searchFieldMetadataRepository.save({
      objectMetadataId,
      fieldMetadataId,
      workspaceId,
    });
  }

  async setFieldNonSearchable(
    objectMetadataId: string,
    fieldMetadataId: string,
  ): Promise<void> {
    await this.searchFieldMetadataRepository.delete({
      objectMetadataId,
      fieldMetadataId,
    });
  }
}
