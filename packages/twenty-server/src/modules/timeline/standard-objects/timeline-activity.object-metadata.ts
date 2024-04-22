import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { timelineActivityStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { DynamicRelationFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/dynamic-field-metadata.interface';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/standard-objects/company.object-metadata';
import { OpportunityObjectMetadata } from 'src/modules/opportunity/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { CustomObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/custom-objects/custom.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.timelineActivity,
  namePlural: 'timelineActivities',
  labelSingular: 'Timeline Activity',
  labelPlural: 'Timeline Activities',
  description: 'Aggregated / filtered event to be displayed on the timeline',
  icon: 'IconIconTimelineEvent',
})
@IsSystem()
@IsNotAuditLogged()
export class TimelineActivityObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.happensAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Creation date',
    description: 'Creation date',
    icon: 'IconCalendar',
    defaultValue: 'now',
  })
  happensAt: Date;

  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.name,
    type: FieldMetadataType.TEXT,
    label: 'Event name',
    description: 'Event name',
    icon: 'IconAbc',
  })
  name: string;

  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.properties,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event details',
    description: 'Json value for event details',
    icon: 'IconListDetails',
  })
  @IsNullable()
  properties: JSON;

  // Who made the action
  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Event workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  @IsNullable()
  workspaceMember: Relation<WorkspaceMemberObjectMetadata>;

  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Event person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: Relation<PersonObjectMetadata>;

  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.company,
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Event company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: Relation<CompanyObjectMetadata>;

  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.opportunity,
    type: FieldMetadataType.RELATION,
    label: 'Opportunity',
    description: 'Events opportunity',
    icon: 'IconTargetArrow',
    joinColumn: 'opportunityId',
  })
  @IsNullable()
  opportunity: Relation<OpportunityObjectMetadata>;

  @DynamicRelationFieldMetadata((oppositeObjectMetadata) => ({
    standardId: timelineActivityStandardFieldIds.custom,
    name: oppositeObjectMetadata.nameSingular,
    label: oppositeObjectMetadata.labelSingular,
    description: `Event ${oppositeObjectMetadata.labelSingular}`,
    joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
    icon: 'IconTimeline',
  }))
  custom: Relation<CustomObjectMetadata>;

  // Special objects that don't have their own timeline and are 'link' to the main object
  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.linkedRecordCachedName,
    type: FieldMetadataType.TEXT,
    label: 'Linked Record cached name',
    description: 'Cached record name',
    icon: 'IconAbc',
  })
  linkedRecordCachedName: string;

  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.linkedRecordId,
    type: FieldMetadataType.UUID,
    label: 'Linked Record id',
    description: 'Linked Record id',
    icon: 'IconAbc',
  })
  @IsNullable()
  linkedRecordId: string;

  @FieldMetadata({
    standardId: timelineActivityStandardFieldIds.linkedObjectMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Linked Object Metadata Id',
    description: 'inked Object Metadata Id',
    icon: 'IconAbc',
  })
  @IsNullable()
  linkedObjectMetadataId: string;
}
