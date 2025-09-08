import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { MKT_COMBO_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order-item.workspace-entity';
import { MktComboVariantWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-combo-variant.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_COMBO_NAME = 'mktCombo';
const NAME_FIELD_NAME = 'name';
const DESCRIPTION_FIELD_NAME = 'description';

export const SEARCH_FIELDS_FOR_MKT_COMBO: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: DESCRIPTION_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum MKT_COMBO_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export const MKT_COMBO_STATUS_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_COMBO_STATUS.ACTIVE,
    label: 'Active',
    position: 0,
    color: 'blue',
  },
  {
    value: MKT_COMBO_STATUS.INACTIVE,
    label: 'Inactive',
    position: 1,
    color: 'purple',
  },
  {
    value: MKT_COMBO_STATUS.DELETED,
    label: 'Deleted',
    position: 2,
    color: 'green',
  },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktCombo,
  namePlural: `${TABLE_COMBO_NAME}s`,
  labelSingular: msg`Combo`,
  labelPlural: msg`Combos`,
  description: msg`Combo entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_COMBO_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['description']])
@WorkspaceIsSearchable()
export class MktComboWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_COMBO_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Combo Name`,
    description: msg`Combo name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_COMBO_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Combo Status`,
    description: msg`Combo status (active, inactive, deleted)`,
    icon: 'IconTags',
    options: MKT_COMBO_STATUS_OPTIONS,
  })
  @WorkspaceIsNullable()
  status: MKT_COMBO_STATUS;

  @WorkspaceField({
    standardId: MKT_COMBO_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Combo Description`,
    description: msg`Combo description`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  description?: string;

  @WorkspaceField({
    standardId: MKT_COMBO_FIELD_IDS.price,
    type: FieldMetadataType.NUMBER,
    label: msg`Price`,
    description: msg`Combo price`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  price?: number;

  @WorkspaceRelation({
    standardId: MKT_COMBO_FIELD_IDS.mktComboVariants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Combo Variants`,
    description: msg`Combo variants`,
    icon: 'IconBox',
    inverseSideTarget: () => MktComboVariantWorkspaceEntity,
    inverseSideFieldKey: 'mktCombo',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktComboVariants?: Relation<MktComboVariantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_COMBO_FIELD_IDS.mktOrderItems,
    type: RelationType.ONE_TO_MANY,
    label: msg`Order Items`,
    description: msg`Combo order items`,
    icon: 'IconDeviceDesktop',
    inverseSideTarget: () => MktOrderItemWorkspaceEntity,
    inverseSideFieldKey: 'mktCombo',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktOrderItems?: Relation<MktOrderItemWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_COMBO_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Combo position`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_COMBO_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_COMBO_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the combo`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktCombos',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_COMBO_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the combo`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktCombo',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_COMBO_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_COMBO,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
