import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { FUNCTION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';

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
    standardId: FUNCTION_STANDARD_FIELD_IDS.workspaceId,
    type: FieldMetadataType.TEXT,
    label: 'Workspace Id',
    description: 'Workspace Id of the function',
  })
  workspaceId: string;

  @WorkspaceRelation({
    standardId: FUNCTION_STANDARD_FIELD_IDS.author,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Author',
    description: 'Function author',
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'authoredFunctions',
  })
  author: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('author')
  authorId: string;

  @WorkspaceField({
    standardId: FUNCTION_STANDARD_FIELD_IDS.rawSourcePath,
    type: FieldMetadataType.TEXT,
    label: 'Raw Source Path',
    description: 'Path of the raw source',
  })
  sourceCodePath: string;

  @WorkspaceField({
    standardId: FUNCTION_STANDARD_FIELD_IDS.buildSourcePath,
    type: FieldMetadataType.TEXT,
    label: 'Built Source Path',
    description: 'Path of the built source to execute',
  })
  buildSourcePath: string;

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
