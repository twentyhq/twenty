import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  CreateFieldAction,
  DeleteFieldAction,
  UpdateFieldAction,
  WorkspaceMigrationFieldActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceSchemaFieldActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationFieldActionTypeV2, 'schema'>
{
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  runDeleteFieldSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>,
  ) => {
    return;
  };
  runCreateFieldSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>,
  ) => {
    const { action, queryRunner } = _action;

    const { flatFieldMetadata, flatObjectMetadataWithoutFields } = action;

    const workspaceId = action.flatFieldMetadata.workspaceId;

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadataWithoutFields);

    const serializedDefaultValue = serializeDefaultValue(
      flatFieldMetadata.defaultValue,
    );

    const columnDefinition: WorkspaceSchemaColumnDefinition = {
      name: computeColumnName(flatFieldMetadata.name),
      type: fieldMetadataTypeToColumnType(flatFieldMetadata.type),
      isNullable: flatFieldMetadata.isNullable ?? true,
      isArray: flatFieldMetadata.type === FieldMetadataType.ARRAY,
      isUnique: flatFieldMetadata.isUnique ?? false,
      default: serializedDefaultValue,
    };

    await this.workspaceSchemaManagerService.columnManager.addColumn(
      queryRunner,
      schemaName,
      tableName,
      columnDefinition,
    );

    return;
  };
  runUpdateFieldSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ) => {
    return;
  };
}
