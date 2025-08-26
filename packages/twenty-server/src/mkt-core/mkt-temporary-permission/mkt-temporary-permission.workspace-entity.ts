import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { MKT_TEMPORARY_PERMISSION_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktTemporaryPermission,
  namePlural: 'mktTemporaryPermissions',
  labelSingular: msg`Temporary Permission`,
  labelPlural: msg`Temporary Permissions`,
  description: msg`Temporary access permissions with expiration`,
  icon: 'IconClock',
})
export class MktTemporaryPermissionWorkspaceEntity extends BaseWorkspaceEntity {
  // === GRANTEE & GRANTER ===
  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.granteeWorkspaceMember,
    type: FieldMetadataType.RELATION,
    label: msg`Grantee`,
    description: msg`User who receives the temporary permission`,
    icon: 'IconUser',
  })
  @WorkspaceRelation({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.granteeWorkspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`Grantee`,
    description: msg`User who receives the temporary permission`,
    icon: 'IconUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'receivedTemporaryPermissions',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  granteeWorkspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('granteeWorkspaceMember')
  granteeWorkspaceMemberId: string;

  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.granterWorkspaceMember,
    type: FieldMetadataType.RELATION,
    label: msg`Granter`,
    description: msg`User who grants the temporary permission`,
    icon: 'IconUserCheck',
  })
  @WorkspaceRelation({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.granterWorkspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`Granter`,
    description: msg`User who grants the temporary permission`,
    icon: 'IconUserCheck',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'grantedTemporaryPermissions',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  granterWorkspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('granterWorkspaceMember')
  granterWorkspaceMemberId: string;

  // === PERMISSION SCOPE ===
  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.objectName,
    type: FieldMetadataType.TEXT,
    label: msg`Object Name`,
    description: msg`Name of the object type (e.g., mktKpi, person, company)`,
    icon: 'IconDatabase',
  })
  objectName: string;

  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.recordId,
    type: FieldMetadataType.UUID,
    label: msg`Record ID`,
    description: msg`Specific record ID (null means all records of this object type)`,
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  recordId?: string;

  // === PERMISSIONS GRANTED ===
  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.canRead,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Can Read`,
    description: msg`Permission to read/view the resource`,
    icon: 'IconEye',
    defaultValue: false,
  })
  canRead: boolean;

  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.canUpdate,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Can Update`,
    description: msg`Permission to modify the resource`,
    icon: 'IconEdit',
    defaultValue: false,
  })
  canUpdate: boolean;

  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.canDelete,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Can Delete`,
    description: msg`Permission to delete the resource`,
    icon: 'IconTrash',
    defaultValue: false,
  })
  canDelete: boolean;

  // === TIME CONTROL ===
  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.expiresAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Expires At`,
    description: msg`When this temporary permission expires`,
    icon: 'IconClock',
  })
  expiresAt: Date;

  // === JUSTIFICATION ===
  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.reason,
    type: FieldMetadataType.TEXT,
    label: msg`Reason`,
    description: msg`Why this temporary permission was granted`,
    icon: 'IconMessageCircle',
  })
  reason: string;

  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.purpose,
    type: FieldMetadataType.TEXT,
    label: msg`Purpose`,
    description: msg`Detailed purpose or context for this permission`,
    icon: 'IconBulb',
  })
  @WorkspaceIsNullable()
  purpose?: string;

  // === STATUS TRACKING ===
  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Whether this permission is currently active`,
    icon: 'IconToggleRight',
    defaultValue: true,
  })
  isActive: boolean;

  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.revokedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Revoked At`,
    description: msg`When this permission was revoked (if applicable)`,
    icon: 'IconX',
  })
  @WorkspaceIsNullable()
  revokedAt?: Date;

  @WorkspaceRelation({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.revokedBy,
    type: RelationType.MANY_TO_ONE,
    label: msg`Revoked By`,
    description: msg`User who revoked this permission`,
    icon: 'IconUserX',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'revokedTemporaryPermissions',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  revokedBy?: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('revokedBy')
  revokedById: string;

  @WorkspaceField({
    standardId: MKT_TEMPORARY_PERMISSION_FIELD_IDS.revokeReason,
    type: FieldMetadataType.TEXT,
    label: msg`Revoke Reason`,
    description: msg`Why this permission was revoked`,
    icon: 'IconAlertTriangle',
  })
  @WorkspaceIsNullable()
  revokeReason?: string;
}
