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
import { MKT_RESELLER_TIER_HISTORY_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktResellerWorkspaceEntity } from 'src/mkt-core/mkt-reseller/mkt-reseller.workspace-entity';
import { MktResellerTierWorkspaceEntity } from 'src/mkt-core/mkt-reseller-tier/mkt-reseller-tier.workspace-entity';

export enum TIER_CHANGE_TYPE {
  MANUAL = 'MANUAL',
  AUTO_UPGRADE = 'AUTO_UPGRADE',
  AUTO_DOWNGRADE = 'AUTO_DOWNGRADE',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
}

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktResellerTierHistory,
  namePlural: 'mktResellerTierHistories',
  labelSingular: msg`Reseller Tier History`,
  labelPlural: msg`Reseller Tier Histories`,
  description: msg`History of reseller tier changes in the marketing system.`,
  icon: 'IconHistory',
  shortcut: 'H',
})
@WorkspaceIsSearchable()
export class MktResellerTierHistoryWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.resellerId,
    type: RelationType.MANY_TO_ONE,
    label: msg`Reseller`,
    description: msg`Reseller that had tier change`,
    icon: 'IconBuilding',
    inverseSideTarget: () => MktResellerWorkspaceEntity,
    inverseSideFieldKey: 'tierHistories',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  reseller: Relation<MktResellerWorkspaceEntity>;

  @WorkspaceJoinColumn('reseller')
  resellerId: string;

  @WorkspaceRelation({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.fromTierId,
    type: RelationType.MANY_TO_ONE,
    label: msg`From Tier`,
    description: msg`Previous tier (null if first time)`,
    icon: 'IconStarOff',
    inverseSideTarget: () => MktResellerTierWorkspaceEntity,
    inverseSideFieldKey: 'fromTierHistories',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  fromTier: Relation<MktResellerTierWorkspaceEntity> | null;

  @WorkspaceJoinColumn('fromTier')
  fromTierId: string | null;

  @WorkspaceRelation({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.toTierId,
    type: RelationType.MANY_TO_ONE,
    label: msg`To Tier`,
    description: msg`New tier`,
    icon: 'IconStar',
    inverseSideTarget: () => MktResellerTierWorkspaceEntity,
    inverseSideFieldKey: 'toTierHistories',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  toTier: Relation<MktResellerTierWorkspaceEntity>;

  @WorkspaceJoinColumn('toTier')
  toTierId: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.changeType,
    type: FieldMetadataType.SELECT,
    label: msg`Change Type`,
    description: msg`Type of tier change`,
    icon: 'IconCategory',
    options: [
      {
        value: TIER_CHANGE_TYPE.MANUAL,
        label: 'Manual',
        position: 0,
        color: 'blue',
      },
      {
        value: TIER_CHANGE_TYPE.AUTO_UPGRADE,
        label: 'Auto Upgrade',
        position: 1,
        color: 'green',
      },
      {
        value: TIER_CHANGE_TYPE.AUTO_DOWNGRADE,
        label: 'Auto Downgrade',
        position: 2,
        color: 'orange',
      },
      {
        value: TIER_CHANGE_TYPE.ADMIN_ADJUSTMENT,
        label: 'Admin Adjustment',
        position: 3,
        color: 'purple',
      },
    ],
  })
  @WorkspaceIsNullable()
  changeType?: TIER_CHANGE_TYPE;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.changeReason,
    type: FieldMetadataType.TEXT,
    label: msg`Change Reason`,
    description: msg`Reason for the tier change`,
    icon: 'IconMessageCircle',
  })
  @WorkspaceIsNullable()
  changeReason?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.actualRevenue,
    type: FieldMetadataType.NUMBER,
    label: msg`Actual Revenue`,
    description: msg`Revenue at the time of tier change`,
    icon: 'IconCurrency',
  })
  @WorkspaceIsNullable()
  actualRevenue?: number;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.changedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Changed At`,
    description: msg`When the tier change occurred`,
    icon: 'IconCalendarClock',
  })
  @WorkspaceIsNullable()
  changedAt?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.changedBy,
    type: FieldMetadataType.TEXT,
    label: msg`Changed By`,
    description: msg`User who made the change (null if automatic)`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  changedBy?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.effectiveFrom,
    type: FieldMetadataType.DATE,
    label: msg`Effective From`,
    description: msg`Date when the new tier becomes effective`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  effectiveFrom?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.notes,
    type: FieldMetadataType.TEXT,
    label: msg`Notes`,
    description: msg`Additional notes about the tier change`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  notes?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_RESELLER_TIER_HISTORY_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;
}
