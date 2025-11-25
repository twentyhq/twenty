import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isEmpty from 'lodash.isempty';
import {
  type CompositeType,
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, type QueryRunner, Repository } from 'typeorm';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  type WorkspaceMigrationIndexAction,
  WorkspaceMigrationIndexActionType,
  type WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

@Injectable()
export class IndexMetadataService {
  constructor(
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
  ) {}

  async createIndexMetadata({
    workspaceId,
    objectMetadata,
    fieldMetadataToIndex,
    isUnique,
    isCustom,
    indexType,
    indexWhereClause,
    queryRunner,
  }: {
    workspaceId: string;
    objectMetadata: ObjectMetadataEntity;
    fieldMetadataToIndex: Partial<FieldMetadataEntity>[];
    isUnique: boolean;
    isCustom: boolean;
    indexType?: IndexType;
    indexWhereClause?: string;
    queryRunner?: QueryRunner;
  }) {
    const tableName = computeObjectTargetTable(objectMetadata);

    const columnNames: string[] = fieldMetadataToIndex.map(
      (fieldMetadata) => fieldMetadata.name as string,
    );

    if (isEmpty(columnNames)) {
      throw new Error('Column names must not be empty');
    }

    const indexName = `IDX_${generateDeterministicIndexName([tableName, ...columnNames])}`;

    let result: IndexMetadataEntity;

    const indexMetadataRepository = queryRunner
      ? queryRunner.manager.getRepository(IndexMetadataEntity)
      : this.indexMetadataRepository;

    const existingIndex = await indexMetadataRepository.findOne({
      where: {
        name: indexName,
        workspaceId,
        objectMetadataId: objectMetadata.id,
      },
    });

    if (isDefined(existingIndex)) {
      throw new Error(
        `Index ${indexName} on object metadata ${objectMetadata.nameSingular} already exists`,
      );
    }

    try {
      result = await indexMetadataRepository.save({
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
        ...(isDefined(indexWhereClause) ? { indexWhereClause } : {}),
        ...(isDefined(isUnique) ? { isUnique } : {}),
        isCustom,
      });
    } catch {
      throw new Error(
        `Failed to create index ${indexName} on object metadata ${objectMetadata.nameSingular}`,
      );
    }

    if (!result) {
      throw new Error(
        `Failed to return saved index ${indexName} on object metadata ${objectMetadata.nameSingular}`,
      );
    }
  }

  async createIndex({
    workspaceId,
    objectMetadata,
    fieldMetadataToIndex,
    isUnique,
    isCustom,
    indexType,
    indexWhereClause,
    queryRunner,
  }: {
    workspaceId: string;
    objectMetadata: ObjectMetadataEntity;
    fieldMetadataToIndex: FieldMetadataEntity[];
    isUnique: boolean;
    isCustom: boolean;
    indexType?: IndexType;
    indexWhereClause?: string;
    queryRunner?: QueryRunner;
  }) {
    await this.createIndexMetadata({
      workspaceId,
      objectMetadata,
      fieldMetadataToIndex,
      indexType,
      indexWhereClause,
      isUnique,
      isCustom,
      queryRunner,
    });

    await this.createIndexCreationMigration({
      workspaceId,
      objectMetadata,
      fieldMetadataToIndex,
      isUnique,
      indexType,
      indexWhereClause,
      queryRunner,
    });
  }

  async recomputeUniqueCustomIndexMetadataForField({
    workspaceId,
    objectMetadata,
    updatedFieldMetadata,
    queryRunner,
  }: {
    workspaceId: string;
    objectMetadata: ObjectMetadataEntity;
    updatedFieldMetadata: FieldMetadataEntity;
    queryRunner?: QueryRunner;
  }) {
    const indexMetadataRepository = queryRunner
      ? queryRunner.manager.getRepository(IndexMetadataEntity)
      : this.indexMetadataRepository;

    const [index] = await indexMetadataRepository.find({
      where: {
        objectMetadataId: objectMetadata.id,
        workspaceId,
        indexFieldMetadatas: {
          fieldMetadataId: In([updatedFieldMetadata.id]),
        },
        isUnique: true,
        isCustom: true,
      },
      relations: ['indexFieldMetadatas.fieldMetadata'],
    });

    if (!isDefined(index)) return;

    const updatedIndex = await indexMetadataRepository.save({
      ...index,
      name: `IDX_${generateDeterministicIndexName([
        computeObjectTargetTable(objectMetadata),
        updatedFieldMetadata.name,
      ])}`,
    });

    return {
      updatedIndex,
      previousName: index.name,
    };
  }

  async recomputeIndexMetadataForObject(
    workspaceId: string,
    updatedObjectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'isCustom' | 'id'
    >,
    queryRunner?: QueryRunner,
  ) {
    const indexMetadataRepository = queryRunner
      ? queryRunner.manager.getRepository(IndexMetadataEntity)
      : this.indexMetadataRepository;

    const indexesToRecompute = await indexMetadataRepository.find({
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

      await indexMetadataRepository.update(index.id, {
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

  async deleteIndexMetadata({
    workspaceId,
    objectMetadata,
    fieldMetadataToIndex,
    queryRunner,
  }: {
    workspaceId: string;
    objectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'isCustom' | 'id'
    >;
    fieldMetadataToIndex: Partial<FieldMetadataEntity>[];
    queryRunner?: QueryRunner;
  }) {
    const tableName = computeObjectTargetTable(objectMetadata);

    const columnNames: string[] = fieldMetadataToIndex.map(
      (fieldMetadata) => fieldMetadata.name as string,
    );

    if (isEmpty(columnNames)) {
      throw new Error('Column names must not be empty');
    }

    const indexName = `IDX_${generateDeterministicIndexName([tableName, ...columnNames])}`;

    const indexMetadataRepository = queryRunner
      ? queryRunner.manager.getRepository(IndexMetadataEntity)
      : this.indexMetadataRepository;

    const indexMetadata = await indexMetadataRepository.findOne({
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
      await indexMetadataRepository.delete(indexMetadata.id);
    } catch (error) {
      throw new Error(
        `Failed to delete index metadata with name ${indexName} (error: ${error.message})`,
      );
    }
  }

  computeIndexDeletionMigration({
    objectMetadata,
    fieldMetadataToIndex,
    isUnique,
  }: {
    objectMetadata: ObjectMetadataEntity;
    fieldMetadataToIndex: Partial<FieldMetadataEntity>[];
    isUnique: boolean;
  }) {
    const tableName = computeObjectTargetTable(objectMetadata);

    const columnNames: string[] = fieldMetadataToIndex.map(
      (fieldMetadata) => fieldMetadata.name as string,
    );

    const indexName = `IDX_${generateDeterministicIndexName([tableName, ...columnNames])}`;

    return {
      name: tableName,
      action: WorkspaceMigrationTableActionType.ALTER_INDEXES,
      indexes: [
        {
          action: WorkspaceMigrationIndexActionType.DROP,
          name: indexName,
          columns: [],
          isUnique,
        } satisfies WorkspaceMigrationIndexAction,
      ],
    } satisfies WorkspaceMigrationTableAction;
  }

  computeIndexCreationMigration({
    objectMetadata,
    fieldMetadataToIndex,
    isUnique,
    indexType,
    indexWhereClause,
  }: {
    objectMetadata: ObjectMetadataEntity;
    fieldMetadataToIndex: (Partial<FieldMetadataEntity> & {
      type: FieldMetadataType;
      name: string;
    })[];
    isUnique: boolean;
    indexType?: IndexType;
    indexWhereClause?: string;
  }) {
    const tableName = computeObjectTargetTable(objectMetadata);

    const fieldNames: string[] = fieldMetadataToIndex.map(
      (fieldMetadata) => fieldMetadata.name as string,
    );

    const indexName = `IDX_${generateDeterministicIndexName([tableName, ...fieldNames])}`;

    const columnNames = fieldMetadataToIndex.flatMap((field) => {
      if (isCompositeFieldMetadataType(field.type)) {
        if (!isUnique)
          throw new IndexMetadataException(
            `Non unique index cannot be created for composite field ${field.name}`,
            IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD,
          );

        const compositeType = compositeTypeDefinitions.get(
          field.type,
        ) as CompositeType;

        const uniqueCompositeProperties = compositeType.properties.filter(
          (property) => property.isIncludedInUniqueConstraint,
        );

        return uniqueCompositeProperties.map((subField) =>
          computeCompositeColumnName(field.name, subField),
        );
      }

      return [field.name];
    });

    return {
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
  }

  async createIndexCreationMigration({
    workspaceId,
    objectMetadata,
    fieldMetadataToIndex,
    isUnique,
    indexType,
    indexWhereClause,
    queryRunner,
  }: {
    workspaceId: string;
    objectMetadata: ObjectMetadataEntity;
    fieldMetadataToIndex: FieldMetadataEntity[];
    isUnique: boolean;
    indexType?: IndexType;
    indexWhereClause?: string;
    queryRunner?: QueryRunner;
  }) {
    const migration = this.computeIndexCreationMigration({
      objectMetadata,
      fieldMetadataToIndex,
      isUnique,
      indexType,
      indexWhereClause,
    });

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${objectMetadata.nameSingular}-index`),
      workspaceId,
      [migration],
      queryRunner,
    );
  }

  createIndexRecomputeMigrationActions(
    objectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'isCustom' | 'id'
    >,
    recomputedIndex: {
      indexMetadata: IndexMetadataEntity;
      previousName: string;
      newName: string;
    },
  ) {
    const { previousName, newName, indexMetadata } = recomputedIndex;

    const tableName = computeObjectTargetTable(objectMetadata);

    const indexFieldsMetadataOrdered = indexMetadata.indexFieldMetadatas.sort(
      (a, b) => a.order - b.order,
    );

    const columnNames = indexFieldsMetadataOrdered.map(
      (indexFieldMetadata) => indexFieldMetadata.fieldMetadata.name,
    );

    return {
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
  }

  async createIndexRecomputeMigrations(
    workspaceId: string,
    objectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'isCustom' | 'id'
    >,
    recomputedIndexes: {
      indexMetadata: IndexMetadataEntity;
      previousName: string;
      newName: string;
    }[],
    queryRunner?: QueryRunner,
  ) {
    for (const recomputedIndex of recomputedIndexes) {
      const migration = this.createIndexRecomputeMigrationActions(
        objectMetadata,
        recomputedIndex,
      );

      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`update-${objectMetadata.nameSingular}-index`),
        workspaceId,
        [migration],
        queryRunner,
      );
    }
  }
}
