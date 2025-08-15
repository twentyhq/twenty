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
import { MKT_PRODUCT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order-item/mkt-order-item.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
const TABLE_PRODUCT_NAME = 'mktProduct';
const NAME_FIELD_NAME = 'name';
const DESCRIPTION_FIELD_NAME = 'description';
const CATEGORY_FIELD_NAME = 'category';
const SKU_FIELD_NAME = 'sku';

export const SEARCH_FIELDS_FOR_MKT_PRODUCT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: DESCRIPTION_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: CATEGORY_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: SKU_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum PRODUCT_TYPE {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  SERVICE = 'SERVICE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  LICENSE = 'LICENSE',
  INTERNAL = 'INTERNAL',
  OTHER = 'OTHER',
}
export const PRODUCT_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: PRODUCT_TYPE.PHYSICAL,
    label: 'Physical',
    position: 0,
    color: 'blue',
  },
  {
    value: PRODUCT_TYPE.DIGITAL,
    label: 'Digital',
    position: 1,
    color: 'purple',
  },
  {
    value: PRODUCT_TYPE.SERVICE,
    label: 'Service',
    position: 2,
    color: 'green',
  },
  {
    value: PRODUCT_TYPE.SUBSCRIPTION,
    label: 'Subscription',
    position: 3,
    color: 'orange',
  },
  {
    value: PRODUCT_TYPE.LICENSE,
    label: 'License',
    position: 4,
    color: 'yellow',
  },
  {
    value: PRODUCT_TYPE.INTERNAL,
    label: 'Internal',
    position: 5,
    color: 'red',
  },
  {
    value: PRODUCT_TYPE.OTHER,
    label: 'Other',
    position: 6,
    color: 'gray',
  },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktProduct,
  namePlural: `${TABLE_PRODUCT_NAME}s`,
  labelSingular: msg`Product`,
  labelPlural: msg`Products`,
  description: msg`Product entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_PRODUCT_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['sku']])
@WorkspaceIsSearchable()
export class MktProductWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Product Type`,
    description: msg`Product type (physical, digital, service, subscription, license, other)`,
    icon: 'IconTags',
    options: PRODUCT_TYPE_OPTIONS,
  })
  @WorkspaceIsNullable()
  type: PRODUCT_TYPE;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.code,
    type: FieldMetadataType.TEXT,
    label: msg`Product Code`,
    description: msg`Product code`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  code: string;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Product Name`,
    description: msg`Product name`,
    icon: 'IconBox',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Product description`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  description?: string;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.sku,
    type: FieldMetadataType.TEXT,
    label: msg`SKU`,
    description: msg`Stock Keeping Unit - unique product identifier`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  sku?: string;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.inStock,
    type: FieldMetadataType.BOOLEAN,
    label: msg`In Stock`,
    description: msg`Whether the product is currently in stock`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  inStock?: boolean;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.category,
    type: FieldMetadataType.TEXT,
    label: msg`Product Category`,
    description: msg`Product category`,
    icon: 'IconCategory',
  })
  @WorkspaceIsNullable()
  category?: string;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.price,
    type: FieldMetadataType.NUMBER,
    label: msg`Price`,
    description: msg`Price`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  price: number;


  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Is product active?`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  isActive: boolean;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_PRODUCT_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the product`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktProducts',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_PRODUCT_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the product`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktProduct',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_PRODUCT_FIELD_IDS.mktVariants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Variants`,
    description: msg`List of product variants`,
    icon: 'IconBoxMultiple',
    inverseSideTarget: () => MktVariantWorkspaceEntity,
    inverseSideFieldKey: 'mktProduct',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktVariants: Relation<MktVariantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_PRODUCT_FIELD_IDS.orderItems,
    type: RelationType.ONE_TO_MANY,
    label: msg`Order Items`,
    description: msg`Order items that include this product`,
    icon: 'IconShoppingCartCog',
    inverseSideTarget: () => MktOrderItemWorkspaceEntity,
    inverseSideFieldKey: 'mktProduct',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  orderItems: Relation<MktOrderItemWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_PRODUCT_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_PRODUCT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
