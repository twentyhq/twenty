import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
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
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { TRACEABLE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'linkName';

export const SEARCH_FIELDS_FOR_TRACEABLE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.traceable,
  namePlural: 'traceables',
  labelSingular: msg`Traceable`,
  labelPlural: msg`Traceables`,
  description: msg`A traceable link`,
  icon: 'IconLink',
  labelIdentifierStandardId: TRACEABLE_STANDARD_FIELD_IDS.linkName,
})
@WorkspaceIsNotAuditLogged()
export class TraceableWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.linkName,
    type: FieldMetadataType.TEXT,
    label: msg`Traceable Link Name`,
    description: msg`The name of the traceable link`,
    icon: 'IconLink',
  })
  @WorkspaceIsUnique()
  linkName: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.websiteUrl,
    type: FieldMetadataType.LINKS,
    label: msg`Website URL`,
    description: msg`The URL of the website to redirect to`,
    icon: 'IconLink',
  })
  websiteUrl: LinksMetadata | null;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.campaignName,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign Name`,
    description: msg`The name of the traceable link associated with the link`,
    icon: 'IconMessage',
  })
  campaignName: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.campaignSource,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign Source`,
    description: msg`The source of the traceable link (e.g., Google, Facebook)`,
    icon: 'IconMessage',
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
    standardId: TRACEABLE_STANDARD_FIELD_IDS.keyword,
    type: FieldMetadataType.TEXT,
    label: msg`Keyword`,
    description: msg`The keyword associated with the traceable link`,
    icon: 'IconKey',
  })
  keyword: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.campaignContent,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign Content`,
    description: msg`The content of the traceable link (e.g., bannerSale)`,
    icon: 'IconMessage',
  })
  campaignContent: string;

  @WorkspaceField({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.generatedUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Generated URL`,
    description: msg`The final URL with UTM parameters`,
    icon: 'IconLink',
  })
  generatedUrl: string | null;

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

  @WorkspaceRelation({
    standardId: TRACEABLE_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the tracable link`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

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
