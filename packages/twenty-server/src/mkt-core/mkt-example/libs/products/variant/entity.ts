import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { PRODUCT_VARIANT_STANDARD_FIELD_IDS, VARIANT_TABLE_NAME } from './constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { Relation } from 'typeorm';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { MktVariantAttributeValueWorkspaceEntity } from '../variant_attribute_value';
import { MktProductWorkspaceEntity } from '../product/entity';

@WorkspaceEntity({
  standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.id,
  namePlural: `${VARIANT_TABLE_NAME}s`,
  labelSingular: msg`Product Variant`,
  labelPlural: msg`Product Variants`,
  description: msg`Các biến thể cụ thể của sản phẩm`,
  icon: 'IconBoxMultiple',
  labelIdentifierStandardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.name,
})
export class MktProductVariantWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Tên biến thể sản phẩm`,
    icon: 'IconTag',
  })
  name: string;

  // @WorkspaceField({
  //   standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.productId,
  //   type: FieldMetadataType.UUID,
  //   label: msg`Product`,
  //   description: msg`ID của sản phẩm`,
  //   icon: 'IconBox',
  // })
  // productId field is handled by @WorkspaceJoinColumn below

  @WorkspaceField({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.sku,
    type: FieldMetadataType.TEXT,
    label: msg`SKU`,
    description: msg`Stock Keeping Unit - mã biến thể`,
    icon: 'IconBarcode',
  })
  sku: string;

  @WorkspaceField({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.price,
    type: FieldMetadataType.NUMBER,
    label: msg`Price`,
    description: msg`Giá của biến thể`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  price?: number;

  @WorkspaceField({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.stock,
    type: FieldMetadataType.NUMBER,
    label: msg`Stock`,
    description: msg`Số lượng tồn kho`,
    icon: 'IconStack',
  })
  @WorkspaceIsNullable()
  stock?: number;

  @WorkspaceField({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Trạng thái hoạt động của biến thể`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  isActive?: boolean;

  @WorkspaceField({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created By`,
    description: msg`Người tạo biến thể sản phẩm`,
    icon: 'IconCreativeCommonsSa',
  })
  createdBy: ActorMetadata;

    // Relations
  @WorkspaceRelation({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.product,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Parent product`,
    icon: 'IconBox',
    inverseSideTarget: () => MktProductWorkspaceEntity,
    inverseSideFieldKey: 'variants',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  product: Relation<MktProductWorkspaceEntity> | null;

  @WorkspaceJoinColumn('product')
  productId: string | null;
  
  @WorkspaceRelation({
    standardId: PRODUCT_VARIANT_STANDARD_FIELD_IDS.variantAttributeValues,
    type: RelationType.ONE_TO_MANY,
    label: msg`Variant Attribute Values`,
    description: msg`Các giá trị thuộc tính của biến thể này`,
    icon: 'IconListDetails',
    inverseSideTarget: () => MktVariantAttributeValueWorkspaceEntity,
    inverseSideFieldKey: 'variant',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  variantAttributeValues: Relation<MktVariantAttributeValueWorkspaceEntity[]>;
}
