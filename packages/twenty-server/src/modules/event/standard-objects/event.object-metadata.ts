import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { eventStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CustomObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/custom-objects/custom.object-metadata';
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

@ObjectMetadata({
  standardId: standardObjectIds.event,
  namePlural: 'events',
  labelSingular: 'Event',
  labelPlural: 'Events',
  description: 'An event',
  icon: 'IconJson',
})
@IsSystem()
@IsNotAuditLogged()
export class EventObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: eventStandardFieldIds.properties,
    type: FieldMetadataType.TEXT,
    label: 'Event name',
    description: 'Event name/type',
    icon: 'IconAbc',
  })
  name: string;

  @FieldMetadata({
    standardId: eventStandardFieldIds.properties,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event details',
    description: 'Json value for event details',
    icon: 'IconListDetails',
  })
  @IsNullable()
  properties: JSON;

  @FieldMetadata({
    standardId: eventStandardFieldIds.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Event workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  @IsNullable()
  workspaceMember: Relation<WorkspaceMemberObjectMetadata>;

  @FieldMetadata({
    standardId: eventStandardFieldIds.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Event person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: Relation<PersonObjectMetadata>;

  @FieldMetadata({
    standardId: eventStandardFieldIds.company,
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Event company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: Relation<CompanyObjectMetadata>;

  @FieldMetadata({
    standardId: eventStandardFieldIds.opportunity,
    type: FieldMetadataType.RELATION,
    label: 'Opportunity',
    description: 'Events opportunity',
    icon: 'IconTargetArrow',
    joinColumn: 'opportunityId',
  })
  @IsNullable()
  opportunity: Relation<OpportunityObjectMetadata>;

  @DynamicRelationFieldMetadata((oppositeObjectMetadata) => ({
    standardId: eventStandardFieldIds.custom,
    name: oppositeObjectMetadata.nameSingular,
    label: oppositeObjectMetadata.labelSingular,
    description: `Event ${oppositeObjectMetadata.labelSingular}`,
    joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
    icon: 'IconBuildingSkyscraper',
  }))
  custom: Relation<CustomObjectMetadata>;
}
