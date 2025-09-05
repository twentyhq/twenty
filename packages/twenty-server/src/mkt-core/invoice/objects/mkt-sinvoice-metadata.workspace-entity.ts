import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
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
import { MKT_SINVOICE_METADATA_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktSInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_NAME = 'mktSInvoiceMetadata';
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_SINVOICE_METADATA: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktSInvoiceMetadata,
  namePlural: `${TABLE_NAME}s`,
  labelSingular: msg`SInvoice Metadata`,
  labelPlural: msg`SInvoice Metadata`,
  description: msg`SInvoice Metadata entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_SINVOICE_METADATA_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name']])
@WorkspaceIsSearchable()
export class MktSInvoiceMetadataWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Metadata Name`,
    description: msg`SInvoice Metadata name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.keyTag,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Metadata Key Tag`,
    description: msg`SInvoice Metadata key tag`,
    icon: 'IconTags',
  })
  @WorkspaceIsNullable()
  keyTag: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.stringValue,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Metadata String Value`,
    description: msg`SInvoice Metadata string value`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  stringValue?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.valueType,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Metadata Value Type`,
    description: msg`SInvoice Metadata value type`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  valueType?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.keyLabel,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Metadata Key Label`,
    description: msg`SInvoice Metadata key label`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  keyLabel?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.mktSInvoice,
    type: RelationType.MANY_TO_ONE,
    label: msg`SInvoice`,
    description: msg`SInvoice`,
    icon: 'IconBox',
    inverseSideTarget: () => MktSInvoiceWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoiceMetadata',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktSInvoice: Relation<MktSInvoiceWorkspaceEntity>;
  @WorkspaceJoinColumn('mktSInvoice')
  mktSInvoiceId: string;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the SInvoice Metadata`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktSInvoiceMetadata',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the SInvoice Metadata`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoiceMetadata',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_SINVOICE_METADATA_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_SINVOICE_METADATA,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
