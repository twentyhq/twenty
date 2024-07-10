import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { FUNCTION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';

export enum FunctionSyncStatus {
  NOT_READY = 'NOT_READY',
  READY = 'READY',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.function,
  namePlural: 'functions',
  labelSingular: 'Function',
  labelPlural: 'Functions',
  description: 'A function',
})
@WorkspaceIsSystem()
export class FunctionWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: FUNCTION_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Function Name',
    description: 'Name of the function',
  })
  name: string;

  @WorkspaceField({
    standardId: FUNCTION_STANDARD_FIELD_IDS.rawSourcePath,
    type: FieldMetadataType.TEXT,
    label: 'Raw Source Path',
    description: 'Path of the raw source',
  })
  sourceCodePath: string;

  @WorkspaceField({
    standardId: FUNCTION_STANDARD_FIELD_IDS.builtSourcePath,
    type: FieldMetadataType.TEXT,
    label: 'Built Source Path',
    description: 'Path of the built source to execute',
  })
  builtSourcePath: string;

  @WorkspaceField({
    standardId: FUNCTION_STANDARD_FIELD_IDS.lambdaName,
    type: FieldMetadataType.TEXT,
    label: 'Lambda name',
    description: 'Lambda name',
  })
  @WorkspaceIsNullable()
  lambdaName: string;

  @WorkspaceField({
    standardId: FUNCTION_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: 'Sync status',
    description: 'Sync status',
    icon: 'IconStatusChange',
    options: [
      {
        value: FunctionSyncStatus.READY,
        label: 'Ready',
        position: 1,
        color: 'green',
      },
      {
        value: FunctionSyncStatus.NOT_READY,
        label: 'Not Ready',
        position: 2,
        color: 'yellow',
      },
    ],
  })
  @WorkspaceIsNullable()
  syncStatus: FunctionSyncStatus | null;
}
