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
import { MKT_CONTRACT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';
// import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_CONTRACT_NAME = 'mktContract';
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_CONTRACT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum MKT_CONTRACT_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export const MKT_CONTRACT_STATUS_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_CONTRACT_STATUS.ACTIVE,
    label: 'Active',
    position: 0,
    color: 'blue',
  },
  {
    value: MKT_CONTRACT_STATUS.INACTIVE,
    label: 'Inactive',
    position: 1,
    color: 'purple',
  },
  {
    value: MKT_CONTRACT_STATUS.EXPIRED,
    label: 'Expired',
    position: 2,
    color: 'green',
  },
  {
    value: MKT_CONTRACT_STATUS.REVOKED,
    label: 'Revoked',
    position: 3,
    color: 'orange',
  },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktContract,
  namePlural: `${TABLE_CONTRACT_NAME}s`,
  labelSingular: msg`Contract`,
  labelPlural: msg`Contracts`,
  description: msg`Contract entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_CONTRACT_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name']])
@WorkspaceIsSearchable()
export class MktContractWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_CONTRACT_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`License Name`,
    description: msg`License name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_CONTRACT_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`License Status`,
    description: msg`License status (active, inactive, expired, revoked)`,
    icon: 'IconTags',
    options: MKT_CONTRACT_STATUS_OPTIONS,
  })
  @WorkspaceIsNullable()
  status: MKT_CONTRACT_STATUS;

  @WorkspaceField({
    standardId: MKT_CONTRACT_FIELD_IDS.startDate,
    type: FieldMetadataType.TEXT,
    label: msg`Start Date`,
    description: msg`Contract start date`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  startDate?: string;

  @WorkspaceField({
    standardId: MKT_CONTRACT_FIELD_IDS.endDate,
    type: FieldMetadataType.TEXT,
    label: msg`End Date`,
    description: msg`Contract end date`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  endDate?: string;

  @WorkspaceField({
    standardId: MKT_CONTRACT_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_CONTRACT_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_CONTRACT_FIELD_IDS.mktOrder,
    type: RelationType.MANY_TO_ONE,
    label: msg`Order`,
    description: msg`Order that this contract belongs to`,
    icon: 'IconShoppingCart',
    inverseSideTarget: () => MktOrderWorkspaceEntity,
    inverseSideFieldKey: 'mktContracts',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktOrder: Relation<MktOrderWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktOrder')
  @WorkspaceIsNullable()
  mktOrderId: string | null;

  @WorkspaceRelation({
    standardId: MKT_CONTRACT_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the contract`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktContracts',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  // Temporarily commented out due to relation conflicts with TimelineActivity
  // @WorkspaceRelation({
  //   standardId: MKT_CONTRACT_FIELD_IDS.timelineActivities,
  //   type: RelationType.ONE_TO_MANY,
  //   label: msg`Timeline Activities`,
  //   description: msg`Timeline Activities linked to the contract`,
  //   icon: 'IconIconTimelineEvent',
  //   inverseSideTarget: () => TimelineActivityWorkspaceEntity,
  //   inverseSideFieldKey: 'mktContract',
  //   onDelete: RelationOnDeleteAction.CASCADE,
  // })
  // @WorkspaceIsNullable()
  // @WorkspaceIsSystem()
  // timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_CONTRACT_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_CONTRACT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
