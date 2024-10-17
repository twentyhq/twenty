import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import { InsertResult, Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  IndexMetadataEntity,
  IndexType,
} from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationIndexActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

@Injectable()
export class IndexMetadataService {
  constructor(
    @InjectRepository(IndexMetadataEntity, 'metadata')
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
  ) {}

  async createIndex(
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

    let result: InsertResult;

    try {
      result = await this.indexMetadataRepository.upsert(
        {
          name: indexName,
          indexFieldMetadatas: fieldMetadataToIndex.map(
            (fieldMetadata, index) => {
              return {
                fieldMetadataId: fieldMetadata.id,
                order: index,
              };
            },
          ),
          workspaceId,
          objectMetadataId: objectMetadata.id,
          ...(isDefined(indexType) ? { indexType: indexType } : {}),
          isCustom: isCustom,
        },
        {
          conflictPaths: ['workspaceId', 'name', 'objectMetadataId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    } catch (error) {
      throw new Error(
        `Failed to create index ${indexName} on object metadata ${objectMetadata.nameSingular}`,
      );
    }

    if (!result.identifiers.length) {
      throw new Error(
        `Failed to return saved index ${indexName} on object metadata ${objectMetadata.nameSingular}`,
      );
    }

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
}
