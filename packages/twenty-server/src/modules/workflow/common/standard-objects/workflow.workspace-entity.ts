import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

const WorkflowStatusOptions = [
  {
    value: WorkflowStatus.DRAFT,
    label: 'Rascunho',
    position: 0,
    color: 'yellow',
  },
  {
    value: WorkflowStatus.ACTIVE,
    label: 'Ativo',
    position: 1,
    color: 'green',
  },
  {
    value: WorkflowStatus.DEACTIVATED,
    label: 'Desativado',
    position: 2,
    color: 'grey',
  },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflow,
  namePlural: 'workflows',
  labelSingular: 'Workflow',
  labelPlural: 'Workflows',
  description: 'Um workflow',
  icon: 'IconSettingsAutomation',
  labelIdentifierStandardId: WORKFLOW_STANDARD_FIELD_IDS.name,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsWorkflowEnabled,
})
export class WorkflowWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Nome',
    description: 'O nome do workflow',
    icon: 'IconSettingsAutomation',
  })
  name: string;

  @WorkspaceField({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.lastPublishedVersionId,
    type: FieldMetadataType.TEXT,
    label: 'ID da Última Versão Publicada',
    description: 'O ID da última versão publicada do workflow',
    icon: 'IconVersions',
  })
  @WorkspaceIsNullable()
  lastPublishedVersionId: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.statuses,
    type: FieldMetadataType.MULTI_SELECT,
    label: 'Status',
    description: 'Os status atuais das versões do workflow',
    options: WorkflowStatusOptions,
  })
  @WorkspaceIsNullable()
  statuses: WorkflowStatus[] | null;

  @WorkspaceField({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Posição',
    description: 'Posição do registro do workflow',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.versions,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Versões',
    description: 'Versões do workflow vinculadas ao workflow.',
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  versions: Relation<WorkflowVersionWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.runs,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Execuções',
    description: 'Execuções de workflow vinculadas ao workflow.',
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowRunWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  runs: Relation<WorkflowRunWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.eventListeners,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Ouvintes de Evento',
    description: 'Ouvintes de evento do workflow vinculados ao workflow.',
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowEventListenerWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  eventListeners: Relation<WorkflowEventListenerWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favoritos',
    description: 'Favoritos vinculados ao contato',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;
}
