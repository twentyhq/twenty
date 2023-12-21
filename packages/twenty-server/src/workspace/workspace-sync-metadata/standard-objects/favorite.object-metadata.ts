import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  namePlural: 'favorites',
  labelSingular: 'Favorite',
  labelPlural: 'Favorites',
  description: 'A favorite',
  icon: 'IconHeart',
})
@IsSystem()
export class FavoriteObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'Favorite position',
    icon: 'IconList',
    defaultValue: { value: 0 },
  })
  position: number;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Favorite workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  workspaceMember: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Favorite person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: PersonObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Favorite company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: CompanyObjectMetadata;
}
