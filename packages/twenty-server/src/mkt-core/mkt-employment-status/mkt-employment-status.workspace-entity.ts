import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MKT_EMPLOYMENT_STATUS_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktEmploymentStatus,
  namePlural: 'mktEmploymentStatuses',
  labelSingular: msg`Employment Status`,
  labelPlural: msg`Employment Statuses`,
  description: msg`Employee status definitions in the marketing system.`,
  icon: 'IconUserCheck',
  shortcut: 'S',
})
@WorkspaceIsSearchable()
export class MktEmploymentStatusWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.statusCode,
    type: FieldMetadataType.TEXT,
    label: msg`Status Code`,
    description: msg`Unique status code`,
    icon: 'IconCode',
  })
  statusCode: string;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.statusName,
    type: FieldMetadataType.TEXT,
    label: msg`Status Name`,
    description: msg`Display name of the status`,
    icon: 'IconTag',
  })
  statusName: string;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.statusNameEn,
    type: FieldMetadataType.TEXT,
    label: msg`Status Name (English)`,
    description: msg`English name of the status`,
    icon: 'IconLanguage',
  })
  @WorkspaceIsNullable()
  statusNameEn?: string;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Detailed description of the status`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  description?: string;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.isInitialStatus,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Initial Status`,
    description: msg`Default status for new employees`,
    icon: 'IconUserPlus',
  })
  @WorkspaceIsNullable()
  isInitialStatus?: boolean;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.isFinalStatus,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Final Status`,
    description: msg`Final status (terminated)`,
    icon: 'IconUserMinus',
  })
  @WorkspaceIsNullable()
  isFinalStatus?: boolean;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.maxDuration,
    type: FieldMetadataType.NUMBER,
    label: msg`Max Duration (Days)`,
    description: msg`Maximum duration in this status`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  maxDuration?: number;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.requiresApproval,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Requires Approval`,
    description: msg`Status change requires approval`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  requiresApproval?: boolean;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.restrictions,
    type: FieldMetadataType.TEXT,
    label: msg`Restrictions`,
    description: msg`Restrictions for this status`,
    icon: 'IconShieldCheck',
  })
  @WorkspaceIsNullable()
  restrictions?: string;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.allowedNextStatuses,
    type: FieldMetadataType.TEXT,
    label: msg`Allowed Next Statuses`,
    description: msg`Statuses that can be transitioned to`,
    icon: 'IconArrowRight',
  })
  @WorkspaceIsNullable()
  allowedNextStatuses?: string;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.displayOrder,
    type: FieldMetadataType.NUMBER,
    label: msg`Display Order`,
    description: msg`Order of display in status list`,
    icon: 'IconList',
  })
  displayOrder: number;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.statusColor,
    type: FieldMetadataType.TEXT,
    label: msg`Status Color`,
    description: msg`Color for UI display`,
    icon: 'IconPalette',
  })
  @WorkspaceIsNullable()
  statusColor?: string;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Whether this status is currently active`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  isActive?: boolean;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: MKT_EMPLOYMENT_STATUS_FIELD_IDS.staffMembers,
    type: RelationType.ONE_TO_MANY,
    label: msg`People`,
    description: msg`People with this employment status`,
    icon: 'IconUsers',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'employmentStatus',
  })
  people: Relation<PersonWorkspaceEntity[]>;
}
