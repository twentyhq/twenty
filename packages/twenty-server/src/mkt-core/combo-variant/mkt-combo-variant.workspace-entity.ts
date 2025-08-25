import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
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
import { MktComboWorkspaceEntity } from 'src/mkt-core/combo/mkt-combo.workspace-entity';
import { MKT_COMBO_VARIANT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_COMBO_VARIANT_NAME = 'mktComboVariant';
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_COMBO_VARIANT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktComboVariant,
  namePlural: `${TABLE_COMBO_VARIANT_NAME}s`,
  labelSingular: msg`Combo Variant`,
  labelPlural: msg`Combo Variants`,
  description: msg`Combo variant entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_COMBO_VARIANT_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name']])
@WorkspaceIsSearchable()
export class MktComboVariantWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Combo Variant Name`,
    description: msg`Combo variant name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.quantity,
    type: FieldMetadataType.NUMBER,
    label: msg`Combo Variant Quantity`,
    description: msg`Combo variant quantity`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  quantity?: number;

  @WorkspaceRelation({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.mktCombo,
    type: RelationType.MANY_TO_ONE,
    label: msg`Combo`,
    description: msg`Combo`,
    icon: 'IconClock',
    inverseSideTarget: () => MktComboWorkspaceEntity,
    inverseSideFieldKey: 'mktComboVariants',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktCombo?: Relation<MktComboWorkspaceEntity>;

  @WorkspaceJoinColumn('mktCombo')
  mktComboId: string | null;

  @WorkspaceRelation({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.mktVariant,
    type: RelationType.MANY_TO_ONE,
    label: msg`Variant`,
    description: msg`Variant`,
    icon: 'IconBox',
    inverseSideTarget: () => MktVariantWorkspaceEntity,
    inverseSideFieldKey: 'mktComboVariants',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktVariant?: Relation<MktVariantWorkspaceEntity>;

  @WorkspaceJoinColumn('mktVariant')
  mktVariantId: string | null;

  @WorkspaceField({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Combo variant position`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the combo`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktComboVariants',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the combo`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktComboVariant',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_COMBO_VARIANT_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_COMBO_VARIANT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
