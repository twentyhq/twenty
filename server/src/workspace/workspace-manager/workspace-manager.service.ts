import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import diff from 'microdiff';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { standardObjectsPrefillData } from 'src/workspace/workspace-manager/standard-objects-prefill-data/standard-objects-prefill-data';
import { demoObjectsPrefillData } from 'src/workspace/workspace-manager/demo-objects-prefill-data/demo-objects-prefill-data';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { RelationMetadataService } from 'src/metadata/relation-metadata/relation-metadata.service';
import { standardObjectRelationMetadata } from 'src/workspace/workspace-manager/standard-objects/standard-object-relation-metadata';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { MetadataParser } from 'src/workspace/workspace-manager/utils/metadata.parser';
import { WebhookObjectMetadata } from 'src/workspace/workspace-manager/standard-objects/webook.object-metadata';
import { ApiKeyObjectMetadata } from 'src/workspace/workspace-manager/standard-objects/api-key.object-metadata';
import { ViewSortObjectMetadata } from 'src/workspace/workspace-manager/standard-objects/view-sort.object-metadata';
import {
  filterIgnoredProperties,
  mapObjectMetadataByUniqueIdentifier,
} from 'src/workspace/workspace-manager/utils/sync-metadata.util';

import {
  basicFieldsMetadata,
  standardObjectsMetadata,
} from './standard-objects/standard-object-metadata';

@Injectable()
export class WorkspaceManagerService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly dataSourceService: DataSourceService,
    private readonly relationMetadataService: RelationMetadataService,

    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  /**
   * Init a workspace by creating a new data source and running all migrations
   * @param workspaceId
   * @returns Promise<void>
   */
  public async init(workspaceId: string): Promise<void> {
    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    await this.setWorkspaceMaxRow(workspaceId, schemaName);

    await this.workspaceMigrationService.insertStandardMigrations(workspaceId);

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    const createdObjectMetadata =
      await this.createStandardObjectsAndFieldsMetadata(
        dataSourceMetadata.id,
        workspaceId,
      );

    await this.prefillWorkspaceWithStandardObjects(
      dataSourceMetadata,
      workspaceId,
      createdObjectMetadata,
    );
  }

  /**
   * InitDemo a workspace by creating a new data source and running all migrations
   * @param workspaceId
   * @returns Promise<void>
   */
  public async initDemo(workspaceId: string): Promise<void> {
    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    await this.setWorkspaceMaxRow(workspaceId, schemaName);

    await this.workspaceMigrationService.insertStandardMigrations(workspaceId);

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    const createdObjectMetadata =
      await this.createStandardObjectsAndFieldsMetadata(
        dataSourceMetadata.id,
        workspaceId,
      );

    await this.prefillWorkspaceWithDemoObjects(
      dataSourceMetadata,
      workspaceId,
      createdObjectMetadata,
    );
  }

  /**
   *
   * Create all standard objects and fields metadata for a given workspace
   *
   * @param dataSourceId
   * @param workspaceId
   */
  public async createStandardObjectsAndFieldsMetadata(
    dataSourceId: string,
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[]> {
    const createdObjectMetadata = await this.objectMetadataService.createMany(
      Object.values(standardObjectsMetadata).map((objectMetadata: any) => ({
        ...objectMetadata,
        dataSourceId,
        workspaceId,
        isCustom: false,
        isActive: true,
        fields: [...basicFieldsMetadata, ...objectMetadata.fields].map(
          (field) => ({
            ...field,
            workspaceId,
            isCustom: false,
            isActive: true,
          }),
        ),
      })),
    );

    await this.relationMetadataService.createMany(
      Object.values(standardObjectRelationMetadata).map((relationMetadata) =>
        this.createStandardObjectRelations(
          workspaceId,
          createdObjectMetadata,
          relationMetadata,
        ),
      ),
    );

    return createdObjectMetadata;
  }

  /**
   *
   * @param workspaceId
   * @param createdObjectMetadata
   * @param relationMetadata
   * @returns Partial<RelationMetadataEntity>
   */
  private createStandardObjectRelations(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity[],
    relationMetadata: any,
  ) {
    const createdObjectMetadataByNameSingular = createdObjectMetadata.reduce(
      (acc, curr) => {
        acc[curr.nameSingular] = curr;

        return acc;
      },
      {},
    );

    const fromObjectMetadata =
      createdObjectMetadataByNameSingular[
        relationMetadata.fromObjectNameSingular
      ];
    const toObjectMetadata =
      createdObjectMetadataByNameSingular[
        relationMetadata.toObjectNameSingular
      ];

    if (!fromObjectMetadata) {
      throw new Error(
        `Could not find created object metadata with 
          fromObjectNameSingular: ${relationMetadata.fromObjectNameSingular}`,
      );
    }

    if (!toObjectMetadata) {
      throw new Error(
        `Could not find created object metadata with
          toObjectNameSingular: ${relationMetadata.toObjectNameSingular}`,
      );
    }

    const fromFieldMetadata = createdObjectMetadataByNameSingular[
      relationMetadata.fromObjectNameSingular
    ]?.fields.find(
      (field: FieldMetadataEntity) =>
        field.type === FieldMetadataType.RELATION &&
        field.name === relationMetadata.fromFieldMetadataName,
    );

    const toFieldMetadata = createdObjectMetadataByNameSingular[
      relationMetadata.toObjectNameSingular
    ]?.fields.find(
      (field: FieldMetadataEntity) =>
        field.type === FieldMetadataType.RELATION &&
        field.name === relationMetadata.toFieldMetadataName,
    );

    if (!fromFieldMetadata) {
      throw new Error(
        `Could not find created field metadata with 
          fromFieldMetadataName: ${relationMetadata.fromFieldMetadataName}
          for object: ${relationMetadata.fromObjectNameSingular}`,
      );
    }

    if (!toFieldMetadata) {
      throw new Error(
        `Could not find created field metadata with 
          toFieldMetadataName: ${relationMetadata.toFieldMetadataName}
          for object: ${relationMetadata.toObjectNameSingular}`,
      );
    }

    return {
      fromObjectMetadataId: fromObjectMetadata.id,
      toObjectMetadataId: toObjectMetadata.id,
      workspaceId,
      relationType: relationMetadata.type,
      fromFieldMetadataId: fromFieldMetadata.id,
      toFieldMetadataId: toFieldMetadata.id,
    };
  }

  /**
   *
   * Sync all standard objects and fields metadata for a given workspace and data source
   * This will update the metadata if it has changed and generate migrations based on the diff.
   *
   * @param dataSourceId
   * @param workspaceId
   */
  public async syncStandardObjectsAndFieldsMetadata(
    dataSourceId: string,
    workspaceId: string,
  ) {
    const standardObjects = MetadataParser.parseAllMetadata(
      [WebhookObjectMetadata, ApiKeyObjectMetadata, ViewSortObjectMetadata],
      workspaceId,
      dataSourceId,
    );
    const objectsInDB = await this.objectMetadataRepository.find({
      where: { workspaceId, dataSourceId, isCustom: false },
      relations: ['fields'],
    });

    const objectsInDBByName = mapObjectMetadataByUniqueIdentifier(objectsInDB);
    const standardObjectsByName =
      mapObjectMetadataByUniqueIdentifier(standardObjects);

    const objectsToCreate: ObjectMetadataEntity[] = [];
    const objectsToDelete = objectsInDB.filter(
      (objectInDB) => !standardObjectsByName[objectInDB.nameSingular],
    );
    const objectsToUpdate: Record<string, ObjectMetadataEntity> = {};

    const fieldsToCreate: FieldMetadataEntity[] = [];
    const fieldsToDelete: FieldMetadataEntity[] = [];
    const fieldsToUpdate: Record<string, FieldMetadataEntity> = {};

    for (const standardObjectName in standardObjectsByName) {
      const standardObject = standardObjectsByName[standardObjectName];
      const objectInDB = objectsInDBByName[standardObjectName];

      if (!objectInDB) {
        objectsToCreate.push(standardObject);
        continue;
      }

      // Deconstruct fields and compare objects and fields independently
      const { fields: objectInDBFields, ...objectInDBWithoutFields } =
        objectInDB;
      const { fields: standardObjectFields, ...standardObjectWithoutFields } =
        standardObject;

      const objectPropertiesToIgnore = [
        'id',
        'createdAt',
        'updatedAt',
        'labelIdentifierFieldMetadataId',
        'imageIdentifierFieldMetadataId',
      ];
      const objectDiffWithoutIgnoredProperties = filterIgnoredProperties(
        objectInDBWithoutFields,
        objectPropertiesToIgnore,
      );

      const fieldPropertiesToIgnore = [
        'id',
        'createdAt',
        'updatedAt',
        'objectMetadataId',
      ];
      const objectInDBFieldsWithoutDefaultFields = Object.fromEntries(
        Object.entries(objectInDBFields).map(([key, value]) => {
          if (value === null || typeof value !== 'object') {
            return [key, value];
          }

          return [key, filterIgnoredProperties(value, fieldPropertiesToIgnore)];
        }),
      );

      // Compare objects
      const objectDiff = diff(
        objectDiffWithoutIgnoredProperties,
        standardObjectWithoutFields,
      );

      // Compare fields
      const fieldsDiff = diff(
        objectInDBFieldsWithoutDefaultFields,
        standardObjectFields,
      );

      for (const diff of objectDiff) {
        // We only handle CHANGE here as REMOVE and CREATE are handled earlier.
        if (diff.type === 'CHANGE') {
          const property = diff.path[0];

          objectsToUpdate[objectInDB.id] = {
            ...objectsToUpdate[objectInDB.id],
            [property]: diff.value,
          };
        }
      }

      for (const diff of fieldsDiff) {
        if (diff.type === 'CREATE') {
          const fieldName = diff.path[0];
          const fieldMetadata = standardObjectFields[fieldName];

          fieldsToCreate.push(fieldMetadata);
        }
        if (diff.type === 'CHANGE') {
          const fieldName = diff.path[0];
          const property = diff.path[diff.path.length - 1];
          const fieldMetadata = objectInDBFields[fieldName];

          fieldsToUpdate[fieldMetadata.id] = {
            ...fieldsToUpdate[fieldMetadata.id],
            [property]: diff.value,
          };
        }
        if (diff.type === 'REMOVE') {
          const fieldName = diff.path[0];
          const fieldMetadata = objectInDBFields[fieldName];

          fieldsToDelete.push(fieldMetadata);
        }
      }
      // console.log(standardObjectName + ':objectDiff', objectDiff);
      // console.log(standardObjectName + ':fieldsDiff', fieldsDiff);
    }

    // TODO: Sync relationMetadata
    // NOTE: Relations are handled like any field during the diff, so we ignore the relationMetadata table
    // during the diff as it depends on the 2 fieldMetadata that we will compare here.
    // However we need to make sure the relationMetadata table is in sync with the fieldMetadata table.

    // TODO: Use transactions
    // CREATE OBJECTS
    try {
      await this.objectMetadataRepository.save(objectsToCreate);
      // UPDATE OBJECTS, this is not optimal as we are running n queries here.
      for (const [key, value] of Object.entries(objectsToUpdate)) {
        await this.objectMetadataRepository.update(key, value);
      }
      // DELETE OBJECTS
      if (objectsToDelete.length > 0) {
        await this.objectMetadataRepository.delete(
          objectsToDelete.map((object) => object.id),
        );
      }

      // CREATE FIELDS
      await this.fieldMetadataRepository.save(fieldsToCreate);
      // UPDATE FIELDS
      for (const [key, value] of Object.entries(fieldsToUpdate)) {
        await this.fieldMetadataRepository.update(key, value);
      }
      // DELETE FIELDS
      if (fieldsToDelete.length > 0) {
        await this.fieldMetadataRepository.delete(
          fieldsToDelete.map((field) => field.id),
        );
      }
    } catch (e) {
      console.error('Sync of standard objects failed with:', e);
    }

    // TODO: Create migrations based on diff from above.
  }

  /**
   *
   * We are updating the pg_graphql max_rows from 30 (default value) to 60
   *
   * @params workspaceId, schemaName
   * @param workspaceId
   */
  private async setWorkspaceMaxRow(workspaceId, schemaName) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource.query(
      `comment on schema ${schemaName} is e'@graphql({"max_rows": 60})'`,
    );
  }

  /**
   *
   * We are prefilling a few standard objects with data to make it easier for the user to get started.
   *
   * @param dataSourceMetadata
   * @param workspaceId
   */
  private async prefillWorkspaceWithStandardObjects(
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity[],
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }
    await standardObjectsPrefillData(
      workspaceDataSource,
      dataSourceMetadata.schema,
      createdObjectMetadata,
    );
  }

  /**
   *
   * We are prefilling a few demo objects with data to make it easier for the user to get started.
   *
   * @param dataSourceMetadata
   * @param workspaceId
   */
  private async prefillWorkspaceWithDemoObjects(
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity[],
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    await demoObjectsPrefillData(
      workspaceDataSource,
      dataSourceMetadata.schema,
      createdObjectMetadata,
    );
  }

  /**
   *
   * Delete a workspace by deleting all metadata and the schema
   *
   * @param workspaceId
   */
  public async delete(workspaceId: string): Promise<void> {
    // Delete data from metadata tables
    await this.objectMetadataService.deleteObjectsMetadata(workspaceId);
    await this.workspaceMigrationService.delete(workspaceId);
    await this.dataSourceService.delete(workspaceId);
    // Delete schema
    await this.workspaceDataSourceService.deleteWorkspaceDBSchema(workspaceId);
  }
}
