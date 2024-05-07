import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { AUDIT_LOGS_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.auditLog,
  namePlural: 'auditLogs',
  labelSingular: 'Audit Log',
  labelPlural: 'Audit Logs',
  description: 'An audit log of actions performed in the system',
  icon: 'IconIconTimelineEvent',
})
@IsSystem()
export class AuditLogObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Event name',
    description: 'Event name/type',
    icon: 'IconAbc',
  })
  name: string;

  @FieldMetadata({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.properties,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event details',
    description: 'Json value for event details',
    icon: 'IconListDetails',
  })
  @IsNullable()
  properties: JSON;

  @FieldMetadata({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.context,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event context',
    description:
      'Json object to provide context (user, device, workspace, etc.)',
    icon: 'IconListDetails',
  })
  @IsNullable()
  context: JSON;

  @FieldMetadata({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.objectName,
    type: FieldMetadataType.TEXT,
    label: 'Object name',
    description: 'If the event is related to a particular object',
    icon: 'IconAbc',
  })
  objectName: string;

  @FieldMetadata({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.objectName,
    type: FieldMetadataType.TEXT,
    label: 'Object name',
    description: 'If the event is related to a particular object',
    icon: 'IconAbc',
  })
  objectMetadataId: string;

  @FieldMetadata({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.recordId,
    type: FieldMetadataType.UUID,
    label: 'Object id',
    description: 'Event name/type',
    icon: 'IconAbc',
  })
  @IsNullable()
  recordId: string;

  @FieldMetadata({
    standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Event workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  @IsNullable()
  workspaceMember: Relation<WorkspaceMemberObjectMetadata>;
}
