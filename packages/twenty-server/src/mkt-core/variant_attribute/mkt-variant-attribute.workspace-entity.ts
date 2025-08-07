import {msg} from '@lingui/core/macro';
import {ActorMetadata} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import {RelationOnDeleteAction} from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import {RelationType} from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {BaseWorkspaceEntity} from 'src/engine/twenty-orm/base.workspace-entity';
import {WorkspaceEntity} from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import {WorkspaceField} from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import {WorkspaceIsNullable} from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import {WorkspaceJoinColumn} from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import {WorkspaceRelation} from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {Relation} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import {FieldMetadataType} from 'twenty-shared/types';

import {SEARCH_VECTOR_FIELD} from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import {IndexType} from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import {WorkspaceFieldIndex} from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import {WorkspaceIsSearchable} from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import {WorkspaceIsSystem} from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import {FieldTypeAndNameMetadata,getTsVectorColumnExpressionFromFields} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import {MktAttributeWorkspaceEntity} from 'src/mkt-core/attribute/mkt-attribute.workspace-entity';
import {MKT_VARIANT_ATTRIBUTE_FIELD_IDS} from 'src/mkt-core/dev-seeder/constants/mkt-field-ids';
import {MKT_OBJECT_IDS} from 'src/mkt-core/dev-seeder/constants/mkt-object-ids';
import {MktVariantWorkspaceEntity} from 'src/mkt-core/variant/mkt-variant.workspace-entity';

const TABLE_VARIANT_ATTRIBUTE_NAME = 'mktVariantAttribute';
const NAME_FIELD_NAME = 'name';
const SEARCH_FIELDS_FOR_MKT_VARIANT_ATTRIBUTE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];


@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktVariantAttribute,
  namePlural: `${TABLE_VARIANT_ATTRIBUTE_NAME}s`,
  labelSingular: msg`Variant Attribute`,
  labelPlural: msg`Variant Attributes`,
  description: msg`Gán thuộc tính cho biến thể sản phẩm`,
  icon: 'IconListDetails',
  labelIdentifierStandardId: MKT_VARIANT_ATTRIBUTE_FIELD_IDS.name,
})

@WorkspaceIsSearchable()
export class MktVariantAttributeWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_VARIANT_ATTRIBUTE_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Name of the variant attribute`,
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_VARIANT_ATTRIBUTE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_VARIANT_ATTRIBUTE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created By`,
    description: msg`The creator of the variant attribute`,
    icon: 'IconUserCircle',
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_VARIANT_ATTRIBUTE_FIELD_IDS.mktVariant,
    type: RelationType.MANY_TO_ONE,
    label: msg`Variant`,
    description: msg`Variant of the attribute`,
    icon: 'IconList',
    inverseSideTarget: () => MktVariantWorkspaceEntity,
    inverseSideFieldKey: 'mktVariantAttributes',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktVariant: Relation<MktVariantWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktVariant')
  mktVariantId: string | null;

  @WorkspaceRelation({
    standardId: MKT_VARIANT_ATTRIBUTE_FIELD_IDS.mktAttribute,
    type: RelationType.MANY_TO_ONE,
    label: msg`Attribute`,
    description: msg`Attribute of the variant`,
    icon: 'IconTag',
    inverseSideTarget: () => MktAttributeWorkspaceEntity,
    inverseSideFieldKey: 'mktVariantAttributes',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktAttribute: Relation<MktAttributeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktAttribute')
  mktAttributeId: string | null;

  @WorkspaceField({
    standardId: MKT_VARIANT_ATTRIBUTE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_VARIANT_ATTRIBUTE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
