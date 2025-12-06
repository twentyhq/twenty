import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { AddSearchFieldInput } from 'src/engine/metadata-modules/search-field-metadata/dtos/inputs/add-search-field.input';
import { RemoveSearchFieldInput } from 'src/engine/metadata-modules/search-field-metadata/dtos/inputs/remove-search-field.input';
import { SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { getSearchVectorExpressionFromMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-search-fields-from-metadata.util';
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
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceSchemaManager: WorkspaceSchemaManagerService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
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

    await this.regenerateSearchVectorColumn(workspaceId, objectMetadataId);

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

    await this.regenerateSearchVectorColumn(workspaceId, objectMetadataId);

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

  private async regenerateSearchVectorColumn(
    workspaceId: string,
    objectMetadataId: string,
  ): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const objectMetadata = await this.objectMetadataRepository.findOne({
        where: { id: objectMetadataId, workspaceId },
        relations: ['fields'],
      });

      if (!objectMetadata) {
        this.logger.warn(
          `Object metadata ${objectMetadataId} not found, skipping searchVector regeneration`,
        );

        return;
      }

      const searchVectorField = objectMetadata.fields.find(
        (field) => field.name === SEARCH_VECTOR_FIELD.name,
      );

      if (!searchVectorField) {
        this.logger.warn(
          `SearchVector field not found for object ${objectMetadataId}, skipping regeneration`,
        );

        return;
      }

      const schemaName = getWorkspaceSchemaName(workspaceId);
      const tableName = computeObjectTargetTable({
        nameSingular: objectMetadata.nameSingular,
        isCustom: objectMetadata.isCustom,
      });

      // Get new search vector expression from SearchFieldMetadataEntity
      const searchVectorExpression =
        await getSearchVectorExpressionFromMetadata(
          queryRunner.manager,
          workspaceId,
          objectMetadataId,
        );

      // Find existing index on searchVector
      const allIndexes = await this.indexMetadataRepository.find({
        where: {
          workspaceId,
          objectMetadataId,
        },
        relations: ['indexFieldMetadatas'],
      });

      const existingIndex = allIndexes.find((index) =>
        index.indexFieldMetadatas.some(
          (indexField) => indexField.fieldMetadataId === searchVectorField.id,
        ),
      );

      // Drop index if it exists
      if (existingIndex) {
        await this.workspaceSchemaManager.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: existingIndex.name,
        });
      }

      // Drop the column
      await this.workspaceSchemaManager.columnManager.dropColumns({
        queryRunner,
        schemaName,
        tableName,
        columnNames: [SEARCH_VECTOR_FIELD.name],
        cascade: true,
      });

      // Recreate the column with new expression (or skip if no expression)
      if (searchVectorExpression) {
        await this.workspaceSchemaManager.columnManager.addColumns({
          queryRunner,
          schemaName,
          tableName,
          columnDefinitions: [
            {
              name: SEARCH_VECTOR_FIELD.name,
              type: 'tsvector',
              isNullable: true,
              generatedType: 'STORED',
              asExpression: searchVectorExpression,
            },
          ],
        });

        // Recreate index if it existed
        if (existingIndex) {
          await this.workspaceSchemaManager.indexManager.createIndex({
            queryRunner,
            schemaName,
            tableName,
            index: {
              name: existingIndex.name,
              columns: [SEARCH_VECTOR_FIELD.name],
              type: existingIndex.indexType,
              isUnique: existingIndex.isUnique,
              where: existingIndex.indexWhereClause ?? undefined,
            },
          });
        }
      }

      this.logger.log(
        `Regenerated searchVector column for object ${objectMetadata.nameSingular} in workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to regenerate searchVector column: ${error}`);

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
