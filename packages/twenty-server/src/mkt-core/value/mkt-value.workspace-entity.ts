import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {Relation} from 'typeorm';
import {RelationOnDeleteAction} from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import {WorkspaceJoinColumn} from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { MKT_OBJECT_IDS } from 'src/mkt-core/dev-seeder/constants/mkt-object-ids';
import { MKT_VALUE_FIELD_IDS } from 'src/mkt-core/dev-seeder/constants/mkt-field-ids';
import { MktAttributeWorkspaceEntity } from 'src/mkt-core/attribute/mkt-attribute.workspace-entity';
import { FieldTypeAndNameMetadata, getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';

const VALUE_TABLE_NAME = 'mktValue';
const VALUE_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_VALUE: FieldTypeAndNameMetadata[] = [
  { name: VALUE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktValue,
  namePlural: `${VALUE_TABLE_NAME}s`,
  labelSingular: msg`Attribute Value`,
  labelPlural: msg`Attribute Values`,
  description: msg`Attribute values (e.g., Color, Size, ...)`,
  icon: 'IconListDetails',
  labelIdentifierStandardId: MKT_VALUE_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class MktValueWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_VALUE_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Attribute name`,
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_VALUE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_VALUE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created By `,
    description: msg`Người tạo`,
    icon: 'IconUserCircle',
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_VALUE_FIELD_IDS.mktAttribute,
    type: RelationType.MANY_TO_ONE,
    label: msg`Attribute`,
    description: msg`Attribute for this value`,
    icon: 'IconList',
    inverseSideTarget: () => MktAttributeWorkspaceEntity,
    inverseSideFieldKey: 'mktValues',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktAttribute: Relation<MktAttributeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktAttribute')
  mktAttributeId: string | null;

  @WorkspaceField({
    standardId: MKT_VALUE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_VALUE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
