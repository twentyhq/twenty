import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { ATTRIBUTE_VALUE_STANDARD_FIELD_IDS, ATTRIBUTE_VALUE_TABLE_NAME } from './constants';
import {ActorMetadata} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {MktVariantAttributeValueWorkspaceEntity} from 'src/mkt-core/mkt-example/libs/products/variant_attribute_value/entity';
import {Relation} from 'typeorm';
import {MktProductAttributeWorkspaceEntity} from 'src/mkt-core/mkt-example/libs/products/attribute/entity';
import {RelationOnDeleteAction} from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import {WorkspaceJoinColumn} from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';

@WorkspaceEntity({
  standardId: ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.id,
  namePlural: `${ATTRIBUTE_VALUE_TABLE_NAME}s`,
  labelSingular: msg`Attribute Value`,
  labelPlural: msg`Attribute Values`,
  description: msg`Các giá trị thuộc tính (ví dụ: Màu sắc, Kích thước, ...)`,
  icon: 'IconListDetails',
  labelIdentifierStandardId: ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.value,
})
export class MktAttributeValueWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.value,
    type: FieldMetadataType.TEXT,
    label: msg`Value`,
    description: msg`Giá trị thuộc tính`,
    icon: 'IconAbc',
  })
  value: string;

  @WorkspaceField({
    standardId: ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.displayOrder,
    type: FieldMetadataType.NUMBER,
    label: msg`Display Order`,
    description: msg`Thứ tự hiển thị`,
    icon: 'IconSortAscending',
  })
  @WorkspaceIsNullable()
  displayOrder?: number;

  @WorkspaceField({
    standardId: ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created By `,
    description: msg`Người tạo`,
    icon: 'IconUserCircle',
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.attributeId,
    type: RelationType.MANY_TO_ONE,
    label: msg`Attribute`,
    description: msg`Thuộc tính của giá trị này`,
    icon: 'IconList',
    inverseSideTarget: () => MktProductAttributeWorkspaceEntity,
    inverseSideFieldKey: 'attributeValues',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  attribute: Relation<MktProductAttributeWorkspaceEntity>;

  @WorkspaceJoinColumn('attribute')
  attributeId: string | null;
}
