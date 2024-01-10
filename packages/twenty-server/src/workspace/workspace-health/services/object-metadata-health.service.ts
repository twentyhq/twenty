import { Injectable } from '@nestjs/common';

import {
  WorkspaceHealthIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { validName } from 'src/workspace/workspace-health/utils/valid-name.util';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';

@Injectable()
export class ObjectMetadataHealthService {
  constructor(private readonly typeORMService: TypeORMService) {}

  async heathCheck(
    schemaName: string,
    objectMetadata: ObjectMetadataEntity,
  ): Promise<WorkspaceHealthIssue[]> {
    const mainDataSource = this.typeORMService.getMainDataSource();
    const issues: WorkspaceHealthIssue[] = [];

    // Check if the table exist in database
    const tableExist = await mainDataSource.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${schemaName}' AND table_name = '${objectMetadata.targetTableName}')`,
    );

    if (
      objectMetadata.isCustom &&
      !objectMetadata.targetTableName.startsWith('_')
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.MISSING_TABLE,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} is marked as custom but doesn't start with "_"`,
      });

      return issues;
    }

    if (!tableExist) {
      issues.push({
        type: WorkspaceHealthIssueType.MISSING_TABLE,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} not found in schema ${schemaName}`,
      });

      return issues;
    }

    if (!objectMetadata.targetTableName) {
      issues.push({
        type: WorkspaceHealthIssueType.TABLE_CONFLICT,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} doesn't have a valid target table name`,
      });
    }

    if (!objectMetadata.dataSourceId) {
      issues.push({
        type: WorkspaceHealthIssueType.TABLE_CONFLICT,
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
        type: WorkspaceHealthIssueType.TABLE_CONFLICT,
        objectMetadata,
        message: `Table ${objectMetadata.targetTableName} doesn't have a valid name or label`,
      });
    }

    return issues;
  }
}
