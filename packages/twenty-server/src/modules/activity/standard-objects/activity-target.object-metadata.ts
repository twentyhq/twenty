import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ACTIVITY_TARGET_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { ActivityObjectMetadata } from 'src/modules/activity/standard-objects/activity.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/standard-objects/company.object-metadata';
import { OpportunityObjectMetadata } from 'src/modules/opportunity/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-object.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceDynamicRelation } from 'src/engine/twenty-orm/decorators/workspace-dynamic-relation.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.activityTarget,
  namePlural: 'activityTargets',
  labelSingular: 'Activity Target',
  labelPlural: 'Activity Targets',
  description: 'An activity target',
  icon: 'IconCheckbox',
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class ActivityTargetObjectMetadata extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.activity,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Activity',
    description: 'ActivityTarget activity',
    icon: 'IconNotes',
    joinColumn: 'activityId',
    inverseSideTarget: () => ActivityObjectMetadata,
    inverseSideFieldKey: 'activityTargets',
  })
  @WorkspaceIsNullable()
  activity: Relation<ActivityObjectMetadata>;

  @WorkspaceRelation({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.person,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Person',
    description: 'ActivityTarget person',
    icon: 'IconUser',
    joinColumn: 'personId',
    inverseSideTarget: () => PersonObjectMetadata,
    inverseSideFieldKey: 'activityTargets',
  })
  @WorkspaceIsNullable()
  person: Relation<PersonObjectMetadata>;

  @WorkspaceRelation({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.company,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Company',
    description: 'ActivityTarget company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
    inverseSideTarget: () => CompanyObjectMetadata,
    inverseSideFieldKey: 'activityTargets',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyObjectMetadata>;

  @WorkspaceRelation({
    standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.opportunity,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Opportunity',
    description: 'ActivityTarget opportunity',
    icon: 'IconTargetArrow',
    joinColumn: 'opportunityId',
    inverseSideTarget: () => OpportunityObjectMetadata,
    inverseSideFieldKey: 'activityTargets',
  })
  @WorkspaceIsNullable()
  opportunity: Relation<OpportunityObjectMetadata>;

  @WorkspaceDynamicRelation({
    type: RelationMetadataType.MANY_TO_ONE,
    argsFactory: (oppositeObjectMetadata) => ({
      standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.custom,
      name: oppositeObjectMetadata.nameSingular,
      label: oppositeObjectMetadata.labelSingular,
      description: `ActivityTarget ${oppositeObjectMetadata.labelSingular}`,
      joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
      icon: 'IconBuildingSkyscraper',
    }),
    inverseSideTarget: () => CustomWorkspaceEntity,
    inverseSideFieldKey: 'activityTargets',
  })
  custom: Relation<CustomWorkspaceEntity>;
}
