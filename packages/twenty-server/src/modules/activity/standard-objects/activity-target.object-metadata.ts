import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ACTIVITY_TARGET_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CustomObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/custom-objects/custom.object-metadata';
import { DynamicRelationFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/dynamic-field-metadata.interface';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { ActivityObjectMetadata } from 'src/modules/activity/standard-objects/activity.object-metadata';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/standard-objects/company.object-metadata';
import { OpportunityObjectMetadata } from 'src/modules/opportunity/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.activityTarget,
  namePlural: 'activityTargets',
  labelSingular: 'Activity Target',
  labelPlural: 'Activity Targets',
  description: 'An activity target',
  icon: 'IconCheckbox',
})
@IsSystem()
@IsNotAuditLogged()
export class ActivityTargetObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.activity,
    type: FieldMetadataType.RELATION,
    label: 'Activity',
    description: 'ActivityTarget activity',
    icon: 'IconNotes',
    joinColumn: 'activityId',
  })
  @IsNullable()
  activity: Relation<ActivityObjectMetadata>;

  @FieldMetadata({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'ActivityTarget person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: Relation<PersonObjectMetadata>;

  @FieldMetadata({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.company,
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'ActivityTarget company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: Relation<CompanyObjectMetadata>;

  @FieldMetadata({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.opportunity,
    type: FieldMetadataType.RELATION,
    label: 'Opportunity',
    description: 'ActivityTarget opportunity',
    icon: 'IconTargetArrow',
    joinColumn: 'opportunityId',
  })
  @IsNullable()
  opportunity: Relation<OpportunityObjectMetadata>;

  @DynamicRelationFieldMetadata((oppositeObjectMetadata) => ({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.custom,
    name: oppositeObjectMetadata.nameSingular,
    label: oppositeObjectMetadata.labelSingular,
    description: `ActivityTarget ${oppositeObjectMetadata.labelSingular}`,
    joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
    icon: 'IconBuildingSkyscraper',
  }))
  custom: Relation<CustomObjectMetadata>;
}
