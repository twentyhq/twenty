import { Injectable } from '@nestjs/common';

import {
  WorkspaceHealthIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceHealthOptions } from 'src/workspace/workspace-health/interfaces/workspace-health-options.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { validName } from 'src/workspace/workspace-health/utils/valid-name.util';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';

@Injectable()
export class ObjectMetadataHealthService {
  constructor(private readonly typeORMService: TypeORMService) {}

  async healthCheck(
    schemaName: string,
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceHealthOptions,
  ): Promise<WorkspaceHealthIssue[]> {
    const issues: WorkspaceHealthIssue[] = [];

    if (options.mode === 'structure' || options.mode === 'all') {
      const structureIssues = await this.structureObjectCheck(
        schemaName,
        objectMetadata,
      );

      issues.push(...structureIssues);
    }

    if (options.mode === 'metadata' || options.mode === 'all') {
      const metadataIssues = this.metadataObjectCheck(objectMetadata);

      issues.push(...metadataIssues);
    }

    return issues;
  }

  /**
   * Check the structure health of the table based on metadata
   * @param schemaName
   * @param objectMetadata
   * @returns WorkspaceHealthIssue[]
   */
  private async structureObjectCheck(
    schemaName: string,
    objectMetadata: ObjectMetadataEntity,
  ): Promise<WorkspaceHealthIssue[]> {
    const mainDataSource = this.typeORMService.getMainDataSource();
    const issues: WorkspaceHealthIssue[] = [];

    // Check if the table exist in database
    const tableExist = await mainDataSource.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${schemaName}' AND table_name = '${objectMetadata.targetTableName}')`,
    );

    if (!tableExist) {
      issues.push({
        type: WorkspaceHealthIssueType.MISSING_TABLE,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} not found in schema ${schemaName}`,
      });

      return issues;
    }

    return issues;
  }

  /**
   * Check ObjectMetadata health
   * @param objectMetadata
   * @returns WorkspaceHealthIssue[]
   */
  private metadataObjectCheck(
    objectMetadata: ObjectMetadataEntity,
  ): WorkspaceHealthIssue[] {
    const issues: WorkspaceHealthIssue[] = [];

    if (
      objectMetadata.isCustom &&
      !objectMetadata.targetTableName.startsWith('_')
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.TABLE_NAME_SHOULD_BE_CUSTOM,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} is marked as custom but doesn't start with "_"`,
      });
    }

    if (!objectMetadata.targetTableName) {
      issues.push({
        type: WorkspaceHealthIssueType.TABLE_TARGET_TABLE_NAME_NOT_VALID,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} doesn't have a valid target table name`,
      });
    }

    if (!objectMetadata.dataSourceId) {
      issues.push({
        type: WorkspaceHealthIssueType.TABLE_DATA_SOURCE_ID_NOT_VALID,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} doesn't have a data source`,
      });
    }

    if (
      !objectMetadata.nameSingular ||
      !objectMetadata.namePlural ||
      !validName(objectMetadata.nameSingular) ||
      !validName(objectMetadata.namePlural) ||
      !objectMetadata.labelSingular ||
      !objectMetadata.labelPlural
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.TABLE_NAME_NOT_VALID,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} doesn't have a valid name or label`,
      });
    }

    return issues;
  }
}
