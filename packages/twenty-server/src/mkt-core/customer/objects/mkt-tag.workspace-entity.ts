import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
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
import { MKT_TAG_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktCustomerTagWorkspaceEntity } from 'src/mkt-core/customer/objects/mkt-customer-tag.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_NAME = 'mktTag';
const NAME_FIELD_NAME = 'name';

export enum MKT_TAG_TYPE {
  SYSTEM = 'SYSTEM',
  CUSTOM = 'CUSTOM',
}

export const MKT_TAG_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_TAG_TYPE.SYSTEM,
    label: 'System',
    color: 'gray',
    position: 1,
  },
  {
    value: MKT_TAG_TYPE.CUSTOM,
    label: 'Custom',
    color: 'green',
    position: 2,
  },
];

export const SEARCH_FIELDS_FOR_MKT_TAG: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktTag,
  namePlural: `${TABLE_NAME}s`,
  labelSingular: msg`Tag`,
  labelPlural: msg`Tags`,
  description: msg`Tag entity for marketing`,
  icon: 'IconUser',
  labelIdentifierStandardId: MKT_TAG_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class MktTagWorkspaceEntity extends BaseWorkspaceEntity {
  // tag fields
  @WorkspaceField({
    standardId: MKT_TAG_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Tag name`,
    icon: 'IconUser',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_TAG_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Type`,
    description: msg`Tag type`,
    icon: 'IconUser',
    options: MKT_TAG_TYPE_OPTIONS,
  })
  @WorkspaceIsNullable()
  type: MKT_TAG_TYPE;

  // common fields & relations
  @WorkspaceField({
    standardId: MKT_TAG_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_TAG_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_TAG_FIELD_IDS.mktCustomerTags,
    type: RelationType.ONE_TO_MANY,
    label: msg`Customer Tags`,
    description: msg`Customer tags of the tag`,
    icon: 'IconTag',
    inverseSideTarget: () => MktCustomerTagWorkspaceEntity,
    inverseSideFieldKey: 'mktTag',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktCustomerTags: Relation<MktCustomerTagWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_TAG_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the tag`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktTags',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_TAG_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the tag`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktTag',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_TAG_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_TAG,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
