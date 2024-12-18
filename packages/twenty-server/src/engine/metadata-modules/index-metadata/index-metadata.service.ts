import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isEmpty from 'lodash.isempty';
import { Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  IndexMetadataEntity,
  IndexType,
} from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationIndexAction,
  WorkspaceMigrationIndexActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class IndexMetadataService {
  constructor(
    @InjectRepository(IndexMetadataEntity, 'metadata')
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
  ) {}

  async createIndexMetadata(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
    fieldMetadataToIndex: Partial<FieldMetadataEntity>[],
    isUnique: boolean,
    isCustom: boolean,
    indexType?: IndexType,
    indexWhereClause?: string,
  ) {
    const tableName = computeObjectTargetTable(objectMetadata);

    const columnNames: string[] = fieldMetadataToIndex.map(
      (fieldMetadata) => fieldMetadata.name as string,
    );

    if (isEmpty(columnNames)) {
      throw new Error('Column names must not be empty');
    }

    const indexName = `IDX_${generateDeterministicIndexName([tableName, ...columnNames])}`;

    let result: IndexMetadataEntity;

    const existingIndex = await this.indexMetadataRepository.findOne({
      where: {
        name: indexName,
        workspaceId,
        objectMetadataId: objectMetadata.id,
      },
    });

    if (existingIndex) {
      throw new Error(
        `Index ${indexName} on object metadata ${objectMetadata.nameSingular} already exists`,
      );
    }

    try {
      result = await this.indexMetadataRepository.save({
        name: indexName,
        indexFieldMetadatas: fieldMetadataToIndex.map(
          (fieldMetadata, index) => ({
            fieldMetadataId: fieldMetadata.id,
            order: index,
          }),
        ),
        workspaceId,
        objectMetadataId: objectMetadata.id,
        ...(isDefined(indexType) ? { indexType } : {}),
        isCustom,
      });
    } catch (error) {
      throw new Error(
        `Failed to create index ${indexName} on object metadata ${objectMetadata.nameSingular}`,
      );
    }

    if (!result) {
      throw new Error(
        `Failed to return saved index ${indexName} on object metadata ${objectMetadata.nameSingular}`,
      );
    }

    await this.createIndexCreationMigration(
      workspaceId,
      objectMetadata,
      fieldMetadataToIndex,
      isUnique,
      isCustom,
      indexType,
      indexWhereClause,
    );
  }

  async recomputeIndexMetadataForObject(
    workspaceId: string,
    updatedObjectMetadata: ObjectMetadataEntity,
  ) {
    const indexesToRecompute = await this.indexMetadataRepository.find({
      where: {
        objectMetadataId: updatedObjectMetadata.id,
        workspaceId,
      },
      relations: ['indexFieldMetadatas.fieldMetadata'],
    });

    const recomputedIndexes: {
      indexMetadata: IndexMetadataEntity;
      previousName: string;
      newName: string;
    }[] = [];

    for (const index of indexesToRecompute) {
      const previousIndexName = index.name;
      const tableName = computeObjectTargetTable(updatedObjectMetadata);

      const indexFieldsMetadataOrdered = index.indexFieldMetadatas.sort(
        (a, b) => a.order - b.order,
      );

      const columnNames = indexFieldsMetadataOrdered.map(
        (indexFieldMetadata) => indexFieldMetadata.fieldMetadata.name,
      );

      const newIndexName = `IDX_${generateDeterministicIndexName([
        tableName,
        ...columnNames,
      ])}`;

      await this.indexMetadataRepository.update(index.id, {
        name: newIndexName,
      });

      recomputedIndexes.push({
        indexMetadata: index,
        previousName: previousIndexName,
        newName: newIndexName,
      });
    }

    return recomputedIndexes;
  }

  async deleteIndexMetadata(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
    fieldMetadataToIndex: Partial<FieldMetadataEntity>[],
  ) {
    const tableName = computeObjectTargetTable(objectMetadata);

    const columnNames: string[] = fieldMetadataToIndex.map(
      (fieldMetadata) => fieldMetadata.name as string,
    );

    if (isEmpty(columnNames)) {
      throw new Error('Column names must not be empty');
    }

    const indexName = `IDX_${generateDeterministicIndexName([tableName, ...columnNames])}`;

    const indexMetadata = await this.indexMetadataRepository.findOne({
      where: {
        name: indexName,
        objectMetadataId: objectMetadata.id,
        workspaceId,
      },
    });

    if (!indexMetadata) {
      throw new Error(`Index metadata with name ${indexName} not found`);
    }

    try {
      await this.indexMetadataRepository.delete(indexMetadata.id);
    } catch (error) {
      throw new Error(
        `Failed to delete index metadata with name ${indexName} (error: ${error.message})`,
      );
    }
  }

  async createIndexCreationMigration(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
    fieldMetadataToIndex: Partial<FieldMetadataEntity>[],
    isUnique: boolean,
    isCustom: boolean,
    indexType?: IndexType,
    indexWhereClause?: string,
  ) {
    const tableName = computeObjectTargetTable(objectMetadata);

    const columnNames: string[] = fieldMetadataToIndex.map(
      (fieldMetadata) => fieldMetadata.name as string,
    );

    const indexName = `IDX_${generateDeterministicIndexName([tableName, ...columnNames])}`;

    const migration = {
      name: tableName,
      action: WorkspaceMigrationTableActionType.ALTER_INDEXES,
      indexes: [
        {
          action: WorkspaceMigrationIndexActionType.CREATE,
          columns: columnNames,
          name: indexName,
          isUnique,
          where: indexWhereClause,
          type: indexType,
        },
      ],
    } satisfies WorkspaceMigrationTableAction;

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${objectMetadata.nameSingular}-index`),
      workspaceId,
      [migration],
    );
  }

  async createIndexRecomputeMigrations(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
    recomputedIndexes: {
      indexMetadata: IndexMetadataEntity;
      previousName: string;
      newName: string;
    }[],
  ) {
    for (const recomputedIndex of recomputedIndexes) {
      const { previousName, newName, indexMetadata } = recomputedIndex;

      const tableName = computeObjectTargetTable(objectMetadata);

      const indexFieldsMetadataOrdered = indexMetadata.indexFieldMetadatas.sort(
        (a, b) => a.order - b.order,
      );

      const columnNames = indexFieldsMetadataOrdered.map(
        (indexFieldMetadata) => indexFieldMetadata.fieldMetadata.name,
      );

      const migration = {
        name: tableName,
        action: WorkspaceMigrationTableActionType.ALTER_INDEXES,
        indexes: [
          {
            action: WorkspaceMigrationIndexActionType.DROP,
            name: previousName,
            columns: [],
            isUnique: indexMetadata.isUnique,
          } satisfies WorkspaceMigrationIndexAction,
          {
            action: WorkspaceMigrationIndexActionType.CREATE,
            columns: columnNames,
            name: newName,
            isUnique: indexMetadata.isUnique,
            where: indexMetadata.indexWhereClause,
            type: indexMetadata.indexType,
          } satisfies WorkspaceMigrationIndexAction,
        ],
      } satisfies WorkspaceMigrationTableAction;

      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`update-${objectMetadata.nameSingular}-index`),
        workspaceId,
        [migration],
      );
    }
  }
}
