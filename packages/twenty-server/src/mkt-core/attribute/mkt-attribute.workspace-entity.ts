import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import {ActorMetadata} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import {RelationOnDeleteAction} from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { FieldTypeAndNameMetadata, getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';

import { MKT_OBJECT_IDS } from 'src/mkt-core/dev-seeder/constants/mkt-object-ids';
import { MKT_ATTRIBUTE_FIELD_IDS } from 'src/mkt-core/dev-seeder/constants/mkt-field-ids';
import {MktVariantAttributeWorkspaceEntity} from 'src/mkt-core/variant_attribute/mkt-variant-attribute.workspace-entity';
import { MktValueWorkspaceEntity } from 'src/mkt-core/value/mkt-value.workspace-entity';

const TABLE_ATTRIBUTE_NAME = 'mktAttribute';
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_ATTRIBUTE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktAttribute,
  namePlural: `${TABLE_ATTRIBUTE_NAME}s`,
  labelSingular: msg`Product Attribute`,
  labelPlural: msg`Product Attributes`,
  description: msg`Gán thuộc tính vào sản phẩm`,
  icon: 'IconTag',
  labelIdentifierStandardId: MKT_ATTRIBUTE_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class MktAttributeWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_ATTRIBUTE_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Tên thuộc tính hiển thị`,
    icon: 'IconTag',
  })
  name: string;
    
  @WorkspaceField({
    standardId: MKT_ATTRIBUTE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_ATTRIBUTE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_ATTRIBUTE_FIELD_IDS.mktProduct,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Parent product`,
    icon: 'IconBox',
    inverseSideTarget: () => MktProductWorkspaceEntity,
    inverseSideFieldKey: 'mktAttributes',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktProduct: MktProductWorkspaceEntity | null;

  @WorkspaceJoinColumn('mktProduct')
  mktProductId: string | null;

  @WorkspaceRelation({
    standardId: MKT_ATTRIBUTE_FIELD_IDS.mktValues,
    type: RelationType.ONE_TO_MANY,
    label: msg`Values`,
    description: msg`Values of the attribute`,
    icon: 'IconList',
    inverseSideTarget: () => MktValueWorkspaceEntity,
    inverseSideFieldKey: 'mktAttribute',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktValues: Relation<MktValueWorkspaceEntity>[];

  @WorkspaceRelation({
    standardId: MKT_ATTRIBUTE_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the product`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktAttributes',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_ATTRIBUTE_FIELD_IDS.mktVariantAttributes,
    type: RelationType.ONE_TO_MANY,
    label: msg`Variant Attributes`,
    description: msg`Variant attributes of the attribute`,
    icon: 'IconList',
    inverseSideTarget: () => MktVariantAttributeWorkspaceEntity,
    inverseSideFieldKey: 'mktAttribute',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktVariantAttributes: Relation<MktVariantAttributeWorkspaceEntity>[];

  @WorkspaceField({
    standardId: MKT_ATTRIBUTE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_ATTRIBUTE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
