import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FAVORITE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CustomObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/custom-objects/custom.object-metadata';
import { DynamicRelationFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/dynamic-field-metadata.interface';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/standard-objects/company.object-metadata';
import { OpportunityObjectMetadata } from 'src/modules/opportunity/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.favorite,
  namePlural: 'favorites',
  labelSingular: 'Favorite',
  labelPlural: 'Favorites',
  description: 'A favorite',
  icon: 'IconHeart',
})
@IsNotAuditLogged()
@IsSystem()
export class FavoriteObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: FAVORITE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'Favorite position',
    icon: 'IconList',
    defaultValue: 0,
  })
  position: number;

  // Relations
  @FieldMetadata({
    standardId: FAVORITE_STANDARD_FIELD_IDS.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Favorite workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  workspaceMember: Relation<WorkspaceMemberObjectMetadata>;

  @FieldMetadata({
    standardId: FAVORITE_STANDARD_FIELD_IDS.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Favorite person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: Relation<PersonObjectMetadata>;

  @FieldMetadata({
    standardId: FAVORITE_STANDARD_FIELD_IDS.company,
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Favorite company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: Relation<CompanyObjectMetadata>;

  @FieldMetadata({
    standardId: FAVORITE_STANDARD_FIELD_IDS.opportunity,
    type: FieldMetadataType.RELATION,
    label: 'Opportunity',
    description: 'Favorite opportunity',
    icon: 'IconTargetArrow',
    joinColumn: 'opportunityId',
  })
  @IsNullable()
  opportunity: Relation<OpportunityObjectMetadata>;

  @DynamicRelationFieldMetadata((oppositeObjectMetadata) => ({
    standardId: FAVORITE_STANDARD_FIELD_IDS.custom,
    name: oppositeObjectMetadata.nameSingular,
    label: oppositeObjectMetadata.labelSingular,
    description: `Favorite ${oppositeObjectMetadata.labelSingular}`,
    joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
    icon: 'IconBuildingSkyscraper',
  }))
  custom: Relation<CustomObjectMetadata>;
}
