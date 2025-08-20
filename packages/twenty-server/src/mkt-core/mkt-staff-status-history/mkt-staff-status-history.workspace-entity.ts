import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MKT_STAFF_STATUS_HISTORY_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktStaffStatusHistory,
  namePlural: 'mktStaffStatusHistories',
  labelSingular: msg`Staff Status History`,
  labelPlural: msg`Staff Status Histories`,
  description: msg`History of staff employment status changes.`,
  icon: 'IconHistory',
  shortcut: 'H',
})
@WorkspaceIsSearchable()
export class MktStaffStatusHistoryWorkspaceEntity extends BaseWorkspaceEntity {
  // Relations
  @WorkspaceRelation({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.staffId,
    type: RelationType.MANY_TO_ONE,
    label: msg`Staff`,
    description: msg`Staff member this history belongs to`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'staffStatusHistories',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  staff: Relation<PersonWorkspaceEntity>;

  @WorkspaceJoinColumn('staff')
  staffId: string;

  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.fromStatusId,
    type: FieldMetadataType.TEXT,
    label: msg`From Status ID`,
    description: msg`Previous employment status`,
    icon: 'IconArrowLeft',
  })
  @WorkspaceIsNullable()
  fromStatusId?: string;

  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.toStatusId,
    type: FieldMetadataType.TEXT,
    label: msg`To Status ID`,
    description: msg`New employment status`,
    icon: 'IconArrowRight',
  })
  toStatusId: string;

  // Change details
  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.changeDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Change Date`,
    description: msg`Date when status change occurred`,
    icon: 'IconCalendarEvent',
  })
  changeDate: string;

  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.changeReason,
    type: FieldMetadataType.TEXT,
    label: msg`Change Reason`,
    description: msg`Reason for status change`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  changeReason?: string;

  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.approvedBy,
    type: FieldMetadataType.TEXT,
    label: msg`Approved By`,
    description: msg`Staff ID who approved this change`,
    icon: 'IconUserCheck',
  })
  @WorkspaceIsNullable()
  approvedBy?: string;

  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.notes,
    type: FieldMetadataType.TEXT,
    label: msg`Notes`,
    description: msg`Additional notes about the status change`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  notes?: string;

  // Expected dates
  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.expectedEndDate,
    type: FieldMetadataType.DATE,
    label: msg`Expected End Date`,
    description: msg`When this status is expected to end`,
    icon: 'IconCalendarDue',
  })
  @WorkspaceIsNullable()
  expectedEndDate?: string;

  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.actualEndDate,
    type: FieldMetadataType.DATE,
    label: msg`Actual End Date`,
    description: msg`When this status actually ended`,
    icon: 'IconCalendarX',
  })
  @WorkspaceIsNullable()
  actualEndDate?: string;

  @WorkspaceField({
    standardId: MKT_STAFF_STATUS_HISTORY_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;
}
