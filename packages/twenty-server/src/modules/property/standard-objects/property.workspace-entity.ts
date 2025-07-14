import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ListingWorkspaceEntity } from 'src/modules/listing/standard-objects/listing.workspace-entity';

@WorkspaceEntity({
  name: 'property',
  namePlural: 'properties',
  labelSingular: msg`Property`,
  labelPlural: msg`Properties`,
  description: msg`A real estate property`,
  icon: 'IconHome',
})
export class PropertyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The property name`,
    icon: 'IconHome',
  })
  name: string;

  @WorkspaceField({
    type: FieldMetadataType.ADDRESS,
    label: msg`Address`,
    description: msg`Address of the property`,
    icon: 'IconMap',
  })
  @WorkspaceIsNullable()
  address: any;

  @WorkspaceField({
    type: FieldMetadataType.NUMBER,
    label: msg`Size`,
    description: msg`Size of the property in square feet`,
    icon: 'IconRuler',
  })
  @WorkspaceIsNullable()
  size: number | null;

  @WorkspaceField({
    type: FieldMetadataType.NUMBER,
    label: msg`Bedrooms`,
    description: msg`Number of bedrooms in the property`,
    icon: 'IconBed',
  })
  @WorkspaceIsNullable()
  bedrooms: number | null;

  @WorkspaceField({
    type: FieldMetadataType.NUMBER,
    label: msg`Bathrooms`,
    description: msg`Number of bathrooms in the property`,
    icon: 'IconBath',
  })
  @WorkspaceIsNullable()
  bathrooms: number | null;

  @WorkspaceRelation({
    type: RelationType.ONE_TO_MANY,
    label: msg`Listings`,
    description: msg`Listings for this property`,
    icon: 'IconTag',
    inverseSideTarget: () => ListingWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  listings: Relation<ListingWorkspaceEntity[]>;
}
