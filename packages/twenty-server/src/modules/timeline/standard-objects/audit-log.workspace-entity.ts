import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { AUDIT_LOGS_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.auditLog,
  namePlural: 'auditLogs',
  labelSingular: 'Audit Log',
  labelPlural: 'Audit Logs',
  description: 'An audit log of actions performed in the system',
  icon: STANDARD_OBJECT_ICONS.auditLog,
  labelIdentifierStandardId: AUDIT_LOGS_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
export class AuditLogWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Event name',
    description: 'Event name/type',
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.properties,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event details',
    description: 'Json value for event details',
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  properties: JSON | null;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.context,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event context',
    description:
      'Json object to provide context (user, device, workspace, etc.)',
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  context: JSON | null;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.objectName,
    type: FieldMetadataType.TEXT,
    label: 'Object name',
    description: 'Object name',
    icon: 'IconAbc',
  })
  objectName: string;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.objectMetadataId,
    type: FieldMetadataType.TEXT,
    label: 'Object metadata id',
    description: 'Object metadata id',
    icon: 'IconAbc',
  })
  objectMetadataId: string;

  @WorkspaceField({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.recordId,
    type: FieldMetadataType.UUID,
    label: 'Record id',
    description: 'Record id',
    icon: 'IconAbc',
  })
  @WorkspaceIsNullable()
  recordId: string | null;

  @WorkspaceRelation({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workspace Member',
    description: 'Event workspace member',
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'auditLogs',
  })
  @WorkspaceIsNullable()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string | null;
}
