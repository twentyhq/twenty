import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import isEqual from 'lodash.isequal';

import {
  WorkspaceHealthColumnIssue,
  WorkspaceHealthIssueType,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DatabaseStructureService } from 'src/engine/workspace-manager/workspace-health/services/database-structure.service';
import { WorkspaceMigrationFieldFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

import {
  AbstractWorkspaceFixer,
  CompareEntity,
} from './abstract-workspace.fixer';

@Injectable()
export class WorkspaceTargetColumnMapFixer extends AbstractWorkspaceFixer<
  WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
  FieldMetadataEntity
> {
  constructor(
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
    private readonly databaseStructureService: DatabaseStructureService,
  ) {
    super(WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID);
  }

  async createWorkspaceMigrations(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    if (issues.length <= 0) {
      return [];
    }

    return this.fixStructureTargetColumnMapIssues(
      manager,
      objectMetadataCollection,
      issues,
    );
  }

  async createMetadataUpdates(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID>[],
  ): Promise<CompareEntity<FieldMetadataEntity>[]> {
    if (issues.length <= 0) {
      return [];
    }

    return this.fixMetadataTargetColumnMapIssues(manager, issues);
  }

  private async fixStructureTargetColumnMapIssues(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrationCollection: Partial<WorkspaceMigrationEntity>[] =
      [];
    const dataSourceRepository = manager.getRepository(DataSourceEntity);

    for (const issue of issues) {
      const objectMetadata = objectMetadataCollection.find(
        (metadata) => metadata.id === issue.fieldMetadata.objectMetadataId,
      );
      const targetColumnMap = generateTargetColumnMap(
        issue.fieldMetadata.type,
        issue.fieldMetadata.isCustom,
        issue.fieldMetadata.name,
      );

      // Skip composite fields, too complicated to fix for now
      if (isCompositeFieldMetadataType(issue.fieldMetadata.type)) {
        continue;
      }

      if (!objectMetadata) {
        throw new Error(
          `Object metadata with id ${issue.fieldMetadata.objectMetadataId} not found`,
        );
      }

      if (!isEqual(issue.fieldMetadata.targetColumnMap, targetColumnMap)) {
        // Retrieve the data source to get the schema name
        const dataSource = await dataSourceRepository.findOne({
          where: {
            id: objectMetadata.dataSourceId,
          },
        });

        if (!dataSource) {
          throw new Error(
            `Data source with id ${objectMetadata.dataSourceId} not found`,
          );
        }

        const columnName = issue.fieldMetadata.targetColumnMap?.value;
        const columnExist =
          await this.databaseStructureService.workspaceColumnExist(
            dataSource.schema,
            computeObjectTargetTable(objectMetadata),
            columnName,
          );

        if (!columnExist) {
          continue;
        }

        const workspaceMigration =
          await this.workspaceMigrationFieldFactory.create(
            objectMetadataCollection,
            [
              {
                current: issue.fieldMetadata,
                altered: {
                  ...issue.fieldMetadata,
                  targetColumnMap,
                },
              },
            ],
            WorkspaceMigrationBuilderAction.UPDATE,
          );

        workspaceMigrationCollection.push(workspaceMigration[0]);
      }
    }

    return workspaceMigrationCollection;
  }

  private async fixMetadataTargetColumnMapIssues(
    manager: EntityManager,
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID>[],
  ): Promise<CompareEntity<FieldMetadataEntity>[]> {
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);
    const updatedEntities: CompareEntity<FieldMetadataEntity>[] = [];

    for (const issue of issues) {
      await fieldMetadataRepository.update(issue.fieldMetadata.id, {
        targetColumnMap: generateTargetColumnMap(
          issue.fieldMetadata.type,
          issue.fieldMetadata.isCustom,
          issue.fieldMetadata.name,
        ),
      });
      const alteredEntity = await fieldMetadataRepository.findOne({
        where: {
          id: issue.fieldMetadata.id,
        },
      });

      updatedEntities.push({
        current: issue.fieldMetadata,
        altered: alteredEntity as FieldMetadataEntity | null,
      });
    }

    return updatedEntities;
  }
}
