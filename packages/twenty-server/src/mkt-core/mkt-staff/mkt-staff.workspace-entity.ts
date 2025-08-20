import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { MKT_STAFF_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktStaff,
  namePlural: 'mktStaffs',
  labelSingular: msg`Staff`,
  labelPlural: msg`Staff Members`,
  description: msg`Staff members in the marketing system.`,
  icon: 'IconUser',
  shortcut: 'S',
})
@WorkspaceIsSearchable()
export class MktStaffWorkspaceEntity extends BaseWorkspaceEntity {
  // ⭐ THE ONLY AUTH REFERENCE - Pure Reference Approach
  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.userWorkspaceId,
    type: FieldMetadataType.TEXT,
    label: msg`Workspace Member ID`,
    description: msg`Reference to workspace member for authentication and permissions`,
    icon: 'IconUserCircle',
  })
  @WorkspaceIsNullable()
  workspaceMemberId?: string;

  // Optional contact info reference
  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.person,
    type: FieldMetadataType.TEXT,
    label: msg`Person ID`,
    description: msg`Reference to person record for contact information`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  personId?: string;

  // Business Identity
  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.employeeId,
    type: FieldMetadataType.TEXT,
    label: msg`Employee ID`,
    description: msg`Unique employee identifier`,
    icon: 'IconId',
  })
  employeeId: string;

  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.position,
    type: FieldMetadataType.TEXT,
    label: msg`Position`,
    description: msg`Job position or role`,
    icon: 'IconBriefcase',
  })
  position: string;

  // Business References (TEXT fields to avoid circular dependencies)
  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.department,
    type: FieldMetadataType.TEXT,
    label: msg`Department ID`,
    description: msg`Department this staff belongs to`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  departmentId: string;

  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.organizationLevel,
    type: FieldMetadataType.TEXT,
    label: msg`Organization Level ID`,
    description: msg`Authority level of this staff`,
    icon: 'IconHierarchy',
  })
  organizationLevelId: string;

  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.employmentStatus,
    type: FieldMetadataType.TEXT,
    label: msg`Employment Status ID`,
    description: msg`Current employment status`,
    icon: 'IconUserCheck',
  })
  @WorkspaceIsNullable()
  employmentStatusId: string;

  // Team hierarchy (self-reference)
  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.teamLeader,
    type: FieldMetadataType.TEXT,
    label: msg`Team Leader ID`,
    description: msg`Reference to team leader staff`,
    icon: 'IconUserCircle',
  })
  @WorkspaceIsNullable()
  teamLeaderId?: string;

  // Employment tracking
  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.statusStartDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Status Start Date`,
    description: msg`Date when current status started`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  statusStartDate?: string;

  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.statusExpectedEndDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Status Expected End Date`,
    description: msg`Expected end date for current status`,
    icon: 'IconCalendarDue',
  })
  @WorkspaceIsNullable()
  statusExpectedEndDate?: string;

  // KPI configuration
  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.hasKpiTracking,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Has KPI Tracking`,
    description: msg`Whether KPI tracking is enabled`,
    icon: 'IconTarget',
  })
  @WorkspaceIsNullable()
  hasKpiTracking?: boolean;

  @WorkspaceField({
    standardId: MKT_STAFF_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;
}
