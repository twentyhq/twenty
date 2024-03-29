import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { favoriteStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
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

@ObjectMetadata({
  standardId: standardObjectIds.favorite,
  namePlural: 'favorites',
  labelSingular: 'Favorite',
  labelPlural: 'Favorites',
  description: 'A favorite',
  icon: 'IconHeart',
})
@IsSystem()
export class FavoriteObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: favoriteStandardFieldIds.position,
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'Favorite position',
    icon: 'IconList',
    defaultValue: 0,
  })
  position: number;

  // Relations
  @FieldMetadata({
    standardId: favoriteStandardFieldIds.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Favorite workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  workspaceMember: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    standardId: favoriteStandardFieldIds.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Favorite person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: PersonObjectMetadata;

  @FieldMetadata({
    standardId: favoriteStandardFieldIds.company,
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Favorite company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: CompanyObjectMetadata;

  @FieldMetadata({
    standardId: favoriteStandardFieldIds.opportunity,
    type: FieldMetadataType.RELATION,
    label: 'Opportunity',
    description: 'Favorite opportunity',
    icon: 'IconTargetArrow',
    joinColumn: 'opportunityId',
  })
  @IsNullable()
  opportunity: OpportunityObjectMetadata;

  @DynamicRelationFieldMetadata((oppositeObjectMetadata) => ({
    standardId: favoriteStandardFieldIds.custom,
    name: oppositeObjectMetadata.nameSingular,
    label: oppositeObjectMetadata.labelSingular,
    description: `Favorite ${oppositeObjectMetadata.labelSingular}`,
    joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
    icon: 'IconBuildingSkyscraper',
  }))
  custom: CustomObjectMetadata;
}
