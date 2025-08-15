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
import { MKT_TEMPLATE_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/mkt-invoice.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_TEMPLATE_NAME = 'mktTemplate';
const NAME_FIELD_NAME = 'name';
const CONTENT_FIELD_NAME = 'content';

export const SEARCH_FIELDS_FOR_MKT_TEMPLATE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: CONTENT_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum MKT_TEMPLATE_TYPE {
  EXECUTIVE_SUMMARY = 'executive_summary',
  KEY_METRICS = 'key_metrics',
  HIGHLIGHTS = 'highlights',
  CHALLENGES = 'challenges',
  NEXT_MONTH_PRIORITIES = 'next_month_priorities',
  MARKETING = 'marketing',
  SALES = 'sales',
  SUPPORT = 'support',
  EMAIL = 'email',
  INVOICE = 'invoice',
  CONTRACT = 'contract',
  TICKET = 'ticket',
  ORDER = 'order',
  SURVEY = 'survey',
  CHECKLIST = 'checklist',
  REPORT = 'report',
  CATALOG = 'catalog',
  NOTIFICATION = 'notification',
  QUOTE = 'quote',
}

export const MKT_TEMPLATE_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_TEMPLATE_TYPE.EXECUTIVE_SUMMARY,
    label: 'Executive Summary',
    position: 0,
    color: 'blue',
  },
  {
    value: MKT_TEMPLATE_TYPE.KEY_METRICS,
    label: 'Key Metrics',
    position: 1,
    color: 'purple',
  },
  {
    value: MKT_TEMPLATE_TYPE.HIGHLIGHTS,
    label: 'Highlights',
    position: 2,
    color: 'green',
  },
  {
    value: MKT_TEMPLATE_TYPE.CHALLENGES,
    label: 'Challenges',
    position: 3,
    color: 'orange',
  },
  {
    value: MKT_TEMPLATE_TYPE.NEXT_MONTH_PRIORITIES,
    label: 'Next Month Priorities',
    position: 4,
    color: 'yellow',
  },
  {
    value: MKT_TEMPLATE_TYPE.MARKETING,
    label: 'Marketing',
    position: 5,
    color: 'blue',
  },
  {
    value: MKT_TEMPLATE_TYPE.SALES,
    label: 'Sales',
    position: 6,
    color: 'green',
  },
  {
    value: MKT_TEMPLATE_TYPE.SUPPORT,
    label: 'Support',
    position: 7,
    color: 'purple',
  },
  {
    value: MKT_TEMPLATE_TYPE.EMAIL,
    label: 'Welcome Email',
    position: 8,
    color: 'orange',
  },
  {
    value: MKT_TEMPLATE_TYPE.INVOICE,
    label: 'Invoice',
    position: 9,
    color: 'pink',
  },
  {
    value: MKT_TEMPLATE_TYPE.CONTRACT,
    label: 'Contract',
    position: 10,
    color: 'blue',
  },
  {
    value: MKT_TEMPLATE_TYPE.TICKET,
    label: 'Ticket',
    position: 11,
    color: 'gray',
  },
  {
    value: MKT_TEMPLATE_TYPE.ORDER,
    label: 'Order',
    position: 12,
    color: 'blue',
  },
  {
    value: MKT_TEMPLATE_TYPE.SURVEY,
    label: 'Feedback Survey',
    position: 13,
    color: 'green',
  },
  {
    value: MKT_TEMPLATE_TYPE.CHECKLIST,
    label: 'Onboarding Checklist',
    position: 14,
    color: 'purple',
  },
  {
    value: MKT_TEMPLATE_TYPE.REPORT,
    label: 'Incident Report',
    position: 15,
    color: 'orange',
  },
  {
    value: MKT_TEMPLATE_TYPE.CATALOG,
    label: 'Product Catalog',
    position: 16,
    color: 'pink',
  },
  {
    value: MKT_TEMPLATE_TYPE.NOTIFICATION,
    label: 'Maintenance Notice',
    position: 17,
    color: 'gray',
  },
  {
    value: MKT_TEMPLATE_TYPE.QUOTE,
    label: 'Quote Request',
    position: 18,
    color: 'blue',
  },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktTemplate,
  namePlural: `${TABLE_TEMPLATE_NAME}s`,
  labelSingular: msg`Template`,
  labelPlural: msg`Templates`,
  description: msg`Template entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_TEMPLATE_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name']])
@WorkspaceIsSearchable()
export class MktTemplateWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_TEMPLATE_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Template Name`,
    description: msg`Template name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_TEMPLATE_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Template Type`,
    description: msg`Template type`,
    icon: 'IconTags',
    options: MKT_TEMPLATE_TYPE_OPTIONS,
  })
  @WorkspaceIsNullable()
  type: MKT_TEMPLATE_TYPE;

  @WorkspaceField({
    standardId: MKT_TEMPLATE_FIELD_IDS.content,
    type: FieldMetadataType.TEXT,
    label: msg`Template Content`,
    description: msg`Template content`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  content?: string;

  @WorkspaceField({
    standardId: MKT_TEMPLATE_FIELD_IDS.version,
    type: FieldMetadataType.TEXT,
    label: msg`Version`,
    description: msg`Template version`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  version?: string;

  @WorkspaceField({
    standardId: MKT_TEMPLATE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_TEMPLATE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_TEMPLATE_FIELD_IDS.mktInvoices,
    type: RelationType.ONE_TO_MANY,
    label: msg`Invoice`,
    description: msg`Template invoice`,
    icon: 'IconBox',
    inverseSideTarget: () => MktInvoiceWorkspaceEntity,
    inverseSideFieldKey: 'mktTemplate',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktInvoices: Relation<MktInvoiceWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_TEMPLATE_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the template`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktTemplates',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_TEMPLATE_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the template`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktTemplate',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_TEMPLATE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_TEMPLATE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
