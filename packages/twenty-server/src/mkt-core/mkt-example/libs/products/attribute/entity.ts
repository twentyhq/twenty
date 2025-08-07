import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { MktProductWorkspaceEntity } from 'src/mkt-core/mkt-example/libs/products/product/entity';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';

import { PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS, ATTRIBUTE_TABLE_NAME } from './constants';
import {ActorMetadata} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import {RelationOnDeleteAction} from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import {MktVariantAttributeValueWorkspaceEntity} from 'src/mkt-core/mkt-example/libs/products/variant_attribute_value/entity';
import {Relation} from 'typeorm';
import {MktAttributeValueWorkspaceEntity} from 'src/mkt-core/mkt-example/libs/products/value/entity';

@WorkspaceEntity({
  standardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.id,
  namePlural: `${ATTRIBUTE_TABLE_NAME}s`,
  labelSingular: msg`Product Attribute`,
  labelPlural: msg`Product Attributes`,
  description: msg`Gán thuộc tính vào sản phẩm`,
  icon: 'IconTag',
  labelIdentifierStandardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.name,
})
export class MktProductAttributeWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Tên thuộc tính hiển thị`,
    icon: 'IconTag',
  })
  name: string;

  @WorkspaceField({
    standardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.displayOrder,
    type: FieldMetadataType.NUMBER,
    label: msg`Display Order`,
    description: msg`Thứ tự hiển thị`,
    icon: 'IconSortAscending',
  })
  @WorkspaceIsNullable()
  displayOrder?: number;

  @WorkspaceField({
    standardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.product,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Parent product`,
    icon: 'IconBox',
    inverseSideTarget: () => MktProductWorkspaceEntity,
    inverseSideFieldKey: 'attributes',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  product: MktProductWorkspaceEntity | null;

  @WorkspaceJoinColumn('product')
  productId: string | null;
  
  @WorkspaceRelation({
    standardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.variantAttributeValues,
    type: RelationType.ONE_TO_MANY,
    label: msg`Variant Attribute Values`,
    description: msg`Các liên kết giá trị thuộc tính của biến thể sử dụng thuộc tính này`,
    icon: 'IconListDetails',
    inverseSideTarget: () => MktVariantAttributeValueWorkspaceEntity,
    inverseSideFieldKey: 'attribute',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  variantAttributeValues: Relation<MktVariantAttributeValueWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.values,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attribute Values`,
    description: msg`Các giá trị thuộc tính sử dụng thuộc tính này`,
    icon: 'IconListDetails',
    inverseSideTarget: () => MktAttributeValueWorkspaceEntity,
    inverseSideFieldKey: 'attribute',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  attributeValues: Relation<MktAttributeValueWorkspaceEntity[]>;
}
