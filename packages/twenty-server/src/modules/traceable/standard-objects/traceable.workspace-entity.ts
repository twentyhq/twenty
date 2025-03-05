import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared';
import { ManyToOne } from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { TRACEABLE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { IntegrationWorkspaceEntity } from 'src/modules/integrations/standard-objects/integration.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'product';

export const SEARCH_FIELDS_FOR_TRACEABLE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.traceable,
  namePlural: 'traceable',
  labelSingular: msg`Traceable`,
  labelPlural: msg`Traceable`,
  description: msg`A traceable link`,
  icon: 'IconLink',
  labelIdentifierStandardId: TRACEABLE_STANDARD_FIELD_IDS.product,
})
@WorkspaceIsNotAuditLogged()
export class TraceableWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.product,
    type: FieldMetadataType.TEXT,
    label: msg`Product`,
    description: msg`Traceable product`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  product: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.linkName,
    type: FieldMetadataType.TEXT,
    label: msg`Link Name`,
    description: msg`The name of the traceable link`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  linkName: string | null;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.websiteUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Website URL`,
    description: msg`The URL of the website to redirect to`,
    icon: 'IconWorld',
  })
  @WorkspaceIsUnique()
  websiteUrl: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.campaignName,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign Name`,
    description: msg`The name of the traceable link associated with the link`,
    icon: 'IconTarget',
  })
  campaignName: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.campaignSource,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign Source`,
    description: msg`The source of the traceable link (e.g., Google, Facebook)`,
    icon: 'IconSource',
  })
  campaignSource: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.meansOfCommunication,
    type: FieldMetadataType.TEXT,
    label: msg`Means of Communication`,
    description: msg`The means of communication used (e.g., email, social media)`,
    icon: 'IconMessage',
  })
  meansOfCommunication: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Traceable record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.keyword,
    type: FieldMetadataType.TEXT,
    label: msg`Keyword`,
    description: msg`The keyword associated with the traceable link`,
    icon: 'IconSearch',
  })
  keyword: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.generatedUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Generated URL`,
    description: msg`The final URL with UTM parameters`,
    icon: 'IconLink',
  })
  generatedUrl: string;

  //Relations
  @WorkspaceRelation({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.customer,
    type: RelationMetadataType.MANY_TO_ONE,
    label: msg`Customer`,
    description: msg`Company linked to the traceable`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'traceables',
  })
  @WorkspaceIsNullable()
  @ManyToOne(() => CompanyWorkspaceEntity, (company) => company.traceables, {
    nullable: true,
  })
  company: CompanyWorkspaceEntity | null;
  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.integration,
    type: RelationMetadataType.MANY_TO_ONE,
    label: msg`Payment Gateway`,
    description: msg`Integration linked to the traceable`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => IntegrationWorkspaceEntity,
    inverseSideFieldKey: 'traceables',
  })
  @WorkspaceIsNullable()
  @ManyToOne(
    () => IntegrationWorkspaceEntity,
    (integration) => integration.traceables,
    {
      nullable: true,
    },
  )
  integration: IntegrationWorkspaceEntity | null;
  @WorkspaceJoinColumn('integration')
  integrationId: string | null;

  @WorkspaceRelation({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.people,
    type: RelationMetadataType.ONE_TO_ONE,
    label: msg`Contact`,
    description: msg`Person linked to the traceable`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  people: Relation<PersonWorkspaceEntity>;
  @WorkspaceJoinColumn('people')
  peopleId: string;

  @WorkspaceRelation({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the traceable`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the traceable`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_TRACEABLE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: any;
}
