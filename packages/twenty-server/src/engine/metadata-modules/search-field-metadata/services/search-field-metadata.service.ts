import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { AddSearchFieldInput } from 'src/engine/metadata-modules/search-field-metadata/dtos/inputs/add-search-field.input';
import { RemoveSearchFieldInput } from 'src/engine/metadata-modules/search-field-metadata/dtos/inputs/remove-search-field.input';
import { SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

@Injectable()
export class SearchFieldMetadataService {
  private readonly logger = new Logger(SearchFieldMetadataService.name);

  constructor(
    @InjectRepository(SearchFieldMetadataEntity)
    private readonly searchFieldMetadataRepository: Repository<SearchFieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async addSearchField({
    addSearchFieldInput,
    workspaceId,
  }: {
    addSearchFieldInput: AddSearchFieldInput;
    workspaceId: string;
  }): Promise<SearchFieldMetadataDTO> {
    const { objectMetadataId, fieldMetadataId } = addSearchFieldInput;

    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: { id: objectMetadataId, workspaceId },
    });

    if (!objectMetadata) {
      throw new Error(
        `Object metadata with id ${objectMetadataId} not found in workspace ${workspaceId}`,
      );
    }

    const fieldMetadata = await this.fieldMetadataRepository.findOne({
      where: { id: fieldMetadataId, workspaceId },
    });

    if (!fieldMetadata) {
      throw new Error(
        `Field metadata with id ${fieldMetadataId} not found in workspace ${workspaceId}`,
      );
    }

    const existingEntry = await this.searchFieldMetadataRepository.findOne({
      where: {
        objectMetadataId,
        fieldMetadataId,
        workspaceId,
      },
    });

    if (isDefined(existingEntry)) {
      throw new Error(
        `Search field metadata already exists for object ${objectMetadataId} and field ${fieldMetadataId} in workspace ${workspaceId}`,
      );
    }

    const searchFieldMetadata = await this.searchFieldMetadataRepository.save({
      objectMetadataId,
      fieldMetadataId,
      workspaceId,
    });

    await this.triggerWorkspaceSync(workspaceId);

    return {
      id: searchFieldMetadata.id,
      objectMetadataId: searchFieldMetadata.objectMetadataId,
      fieldMetadataId: searchFieldMetadata.fieldMetadataId,
      workspaceId: searchFieldMetadata.workspaceId,
      createdAt: searchFieldMetadata.createdAt,
      updatedAt: searchFieldMetadata.updatedAt,
    };
  }

  async removeSearchField({
    removeSearchFieldInput,
    workspaceId,
  }: {
    removeSearchFieldInput: RemoveSearchFieldInput;
    workspaceId: string;
  }): Promise<SearchFieldMetadataDTO> {
    const { objectMetadataId, fieldMetadataId } = removeSearchFieldInput;

    const existingEntry = await this.searchFieldMetadataRepository.findOne({
      where: {
        objectMetadataId,
        fieldMetadataId,
        workspaceId,
      },
    });

    if (!existingEntry) {
      throw new Error(
        `Search field metadata not found for object ${objectMetadataId} and field ${fieldMetadataId} in workspace ${workspaceId}`,
      );
    }

    const dto: SearchFieldMetadataDTO = {
      id: existingEntry.id,
      objectMetadataId: existingEntry.objectMetadataId,
      fieldMetadataId: existingEntry.fieldMetadataId,
      workspaceId: existingEntry.workspaceId,
      createdAt: existingEntry.createdAt,
      updatedAt: existingEntry.updatedAt,
    };

    await this.searchFieldMetadataRepository.remove(existingEntry);

    await this.triggerWorkspaceSync(workspaceId);

    return dto;
  }

  private async triggerWorkspaceSync(workspaceId: string): Promise<void> {
    try {
      const dataSourceMetadata =
        await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
          workspaceId,
        );

      const featureFlags =
        await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

      await this.workspaceSyncMetadataService.synchronize(
        {
          workspaceId,
          dataSourceId: dataSourceMetadata.id,
          featureFlags,
        },
        { applyChanges: true },
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger workspace sync after search field metadata change: ${error}`,
      );
      throw error;
    }
  }
}
