import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { MKT_SINVOICE_AUTH_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_SINVOICE_AUTH_NAME = 'mktSInvoiceAuth';
const NAME_FIELD_NAME = 'name';
const USERNAME_FIELD_NAME = 'username';

export const SEARCH_FIELDS_FOR_MKT_SINVOICE_AUTH: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: USERNAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktSInvoiceAuth,
  namePlural: `${TABLE_SINVOICE_AUTH_NAME}s`,
  labelSingular: msg`SInvoice Auth`,
  labelPlural: msg`SInvoice Auths`,
  description: msg`SInvoice Auth entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_SINVOICE_AUTH_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name']])
export class MktSInvoiceAuthWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Auth Name`,
    description: msg`SInvoice Auth name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.username,
    type: FieldMetadataType.TEXT,
    label: msg`Username`,
    description: msg`Username`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  username?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.password,
    type: FieldMetadataType.TEXT,
    label: msg`Password`,
    description: msg`SInvoice Auth password`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  password?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.accessToken,
    type: FieldMetadataType.TEXT,
    label: msg`AccessToken`,
    description: msg`SInvoice Auth access token`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  accessToken?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.refreshToken,
    type: FieldMetadataType.TEXT,
    label: msg`Refresh Token`,
    description: msg`SInvoice Auth refresh token`,
    icon: 'IconDeviceDesktop',
  })
  @WorkspaceIsNullable()
  refreshToken?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.expiresAt,
    type: FieldMetadataType.TEXT,
    label: msg`Expires At`,
    description: msg`SInvoice Auth expires at`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  expiresAt?: Date;

  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the SInvoice Auth`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktSInvoiceAuths',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the SInvoice Auth`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoiceAuth',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_SINVOICE_AUTH_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_SINVOICE_AUTH,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
