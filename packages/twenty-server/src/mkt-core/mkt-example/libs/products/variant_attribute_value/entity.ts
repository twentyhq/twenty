import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS, VARIANT_ATTRIBUTE_VALUE_TABLE_NAME } from './constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { MktProductVariantWorkspaceEntity } from '../variant';
import {Relation} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import {MktProductAttributeWorkspaceEntity} from 'src/mkt-core/mkt-example/libs/products/attribute';
import {MktAttributeValueWorkspaceEntity} from 'src/mkt-core/mkt-example/libs/products/value/entity';

@WorkspaceEntity({
  standardId: VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.id,
  namePlural: `${VARIANT_ATTRIBUTE_VALUE_TABLE_NAME}s`,
  labelSingular: msg`Variant Attribute Value`,
  labelPlural: msg`Variant Attribute Values`,
  description: msg`Gán giá trị thuộc tính cho biến thể sản phẩm`,
  icon: 'IconListDetails',
  labelIdentifierStandardId: VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.name,
})
export class MktVariantAttributeValueWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Tên gán giá trị thuộc tính cho biến thể`,
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    standardId: VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created By`,
    description: msg`Người tạo`,
    icon: 'IconUserCircle',
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.variant,
    type: RelationType.MANY_TO_ONE,
    label: msg`Variant`,
    description: msg`Biến thể sản phẩm liên kết`,
    icon: 'IconList',
    inverseSideTarget: () => MktProductVariantWorkspaceEntity,
    inverseSideFieldKey: 'variantAttributeValues',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  variant: Relation<MktProductVariantWorkspaceEntity> | null;

  @WorkspaceJoinColumn('variant')
  variantId: string | null;

  @WorkspaceRelation({
    standardId: VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.attributeId,
    type: RelationType.MANY_TO_ONE,
    label: msg`Attribute`,
    description: msg`Thuộc tính liên kết`,
    icon: 'IconTag',
    inverseSideTarget: () => MktProductAttributeWorkspaceEntity,
    inverseSideFieldKey: 'variantAttributeValues',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  attribute: Relation<MktProductAttributeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('attribute')
  attributeId: string | null;
}
