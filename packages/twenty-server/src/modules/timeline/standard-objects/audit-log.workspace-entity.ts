import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { AUDIT_LOGS_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.auditLog,
  namePlural: 'auditLogs',
  labelSingular: 'Registro de Auditoria',
  labelPlural: 'Registros de Auditoria',
  description: 'Um registro de auditoria das ações realizadas no sistema',
  icon: 'IconIconTimelineEvent',
  labelIdentifierStandardId: AUDIT_LOGS_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
export class AuditLogWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Nome do Evento',
    description: 'Nome/tipo do evento',
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.properties,
    type: FieldMetadataType.RAW_JSON,
    label: 'Detalhes do Evento',
    description: 'Valor JSON para detalhes do evento',
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  properties: JSON | null;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.context,
    type: FieldMetadataType.RAW_JSON,
    label: 'Contexto do Evento',
    description:
      'Objeto JSON para fornecer contexto (usuário, dispositivo, espaço de trabalho, etc.)',
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  context: JSON | null;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.objectName,
    type: FieldMetadataType.TEXT,
    label: 'Nome do Objeto',
    description: 'Nome do objeto',
    icon: 'IconAbc',
  })
  objectName: string;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.objectMetadataId,
    type: FieldMetadataType.TEXT,
    label: 'ID de Metadados do Objeto',
    description: 'ID de metadados do objeto',
    icon: 'IconAbc',
  })
  objectMetadataId: string;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.recordId,
    type: FieldMetadataType.UUID,
    label: 'ID do Registro',
    description: 'ID do registro',
    icon: 'IconAbc',
  })
  @WorkspaceIsNullable()
  recordId: string | null;

  @WorkspaceRelation({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Membro do Workspace',
    description: 'Membro do workspace do evento',
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'auditLogs',
  })
  @WorkspaceIsNullable()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string | null;
}
