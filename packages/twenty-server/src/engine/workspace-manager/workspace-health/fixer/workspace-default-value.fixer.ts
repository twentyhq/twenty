import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import {
  WorkspaceHealthColumnIssue,
  WorkspaceHealthIssueType,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFieldFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataDefaultValueFunctionNames,
  fieldMetadataDefaultValueFunctionName,
} from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';

import {
  AbstractWorkspaceFixer,
  CompareEntity,
} from './abstract-workspace.fixer';

type WorkspaceDefaultValueFixerType =
  | WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT
  | WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID;

@Injectable()
export class WorkspaceDefaultValueFixer extends AbstractWorkspaceFixer<WorkspaceDefaultValueFixerType> {
  constructor(
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
  ) {
    super(
      WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT,
      WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID,
    );
  }

  async createWorkspaceMigrations(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceDefaultValueFixerType>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    if (issues.length <= 0) {
      return [];
    }
    const splittedIssues = this.splitIssuesByType(issues);
    const issueNeedingMigration =
      splittedIssues[WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT] ??
      [];

    return this.fixColumnDefaultValueConflictIssues(
      objectMetadataCollection,
      issueNeedingMigration as WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT>[],
    );
  }

  async createMetadataUpdates(
    manager: EntityManager,
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceDefaultValueFixerType>[],
  ): Promise<CompareEntity<FieldMetadataEntity>[]> {
    if (issues.length <= 0) {
      return [];
    }

    const splittedIssues = this.splitIssuesByType(issues);
    const issueNeedingMetadataUpdate =
      splittedIssues[WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID] ??
      [];

    return this.fixColumnDefaultValueNotValidIssues(
      manager,
      issueNeedingMetadataUpdate as WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID>[],
    );
  }

  private async fixColumnDefaultValueConflictIssues(
    objectMetadataCollection: ObjectMetadataEntity[],
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const fieldMetadataUpdateCollection = issues.map((issue) => {
      const oldDefaultValue =
        this.computeFieldMetadataDefaultValueFromColumnDefault(
          issue.columnStructure?.columnDefault,
        );

      return {
        current: {
          ...issue.fieldMetadata,
          defaultValue: oldDefaultValue,
        },
        altered: issue.fieldMetadata,
      };
    });

    return this.workspaceMigrationFieldFactory.create(
      objectMetadataCollection,
      fieldMetadataUpdateCollection,
      WorkspaceMigrationBuilderAction.UPDATE,
    );
  }

  private async fixColumnDefaultValueNotValidIssues(
    manager: EntityManager,
    issues: WorkspaceHealthColumnIssue<WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID>[],
  ): Promise<CompareEntity<FieldMetadataEntity>[]> {
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);
    const updatedEntities: CompareEntity<FieldMetadataEntity>[] = [];

    for (const issue of issues) {
      const currentDefaultValue:
        | FieldMetadataDefaultValue<'default'>
        // Old format for default values
        // TODO: Remove this after all workspaces are migrated
        | { type: FieldMetadataDefaultValueFunctionNames }
        | null = issue.fieldMetadata.defaultValue;
      let alteredDefaultValue: FieldMetadataDefaultValue<'default'> | null =
        null;

      // Check if it's an old function default value
      if (currentDefaultValue && 'type' in currentDefaultValue) {
        alteredDefaultValue = {
          value:
            currentDefaultValue.type as FieldMetadataDefaultValueFunctionNames,
        };
      }

      // Check if it's an old string default value
      if (currentDefaultValue) {
        for (const key of Object.keys(currentDefaultValue)) {
          if (key === 'type') {
            continue;
          }

          const value = currentDefaultValue[key];

          if (
            typeof value === 'string' &&
            !value.startsWith("'") &&
            !fieldMetadataDefaultValueFunctionName[value]
          ) {
            alteredDefaultValue = {
              ...currentDefaultValue,
              ...alteredDefaultValue,
              [key]: `'${value}'`,
            };
          }
        }
      }

      if (alteredDefaultValue === null) {
        continue;
      }

      await fieldMetadataRepository.update(issue.fieldMetadata.id, {
        defaultValue: alteredDefaultValue,
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

  private computeFieldMetadataDefaultValueFromColumnDefault(
    columnDefault: string | undefined,
  ): FieldMetadataDefaultValue<'default'> {
    if (
      columnDefault === undefined ||
      columnDefault === null ||
      columnDefault === 'NULL'
    ) {
      return null;
    }

    if (!isNaN(Number(columnDefault))) {
      return { value: +columnDefault };
    }

    if (columnDefault === 'true') {
      return { value: true };
    }

    if (columnDefault === 'false') {
      return { value: false };
    }

    if (columnDefault === '') {
      return { value: "''" };
    }

    if (columnDefault === 'now()') {
      return { value: 'now' };
    }

    if (columnDefault.startsWith('public.uuid_generate_v4')) {
      return { value: 'uuid' };
    }

    return { value: columnDefault };
  }
}
