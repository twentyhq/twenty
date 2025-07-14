import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { PropertyWorkspaceEntity } from 'src/modules/property/standard-objects/property.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  name: 'listing',
  namePlural: 'listings',
  labelSingular: msg`Listing`,
  labelPlural: msg`Listings`,
  description: msg`A real estate listing`,
  icon: 'IconTag',
})
export class ListingWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The listing name`,
    icon: 'IconTag',
  })
  name: string;

  @WorkspaceField({
    type: FieldMetadataType.CURRENCY,
    label: msg`Price`,
    description: msg`Listing price`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  price: any;

  @WorkspaceField({
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Listing status`,
    icon: 'IconProgressCheck',
    options: [
      { value: 'ACTIVE', label: 'Active', position: 0, color: 'green' },
      { value: 'PENDING', label: 'Pending', position: 1, color: 'yellow' },
      { value: 'SOLD', label: 'Sold', position: 2, color: 'red' },
    ],
    defaultValue: "'ACTIVE'",
  })
  status: string;

  @WorkspaceRelation({
    type: RelationType.MANY_TO_ONE,
    label: msg`Property`,
    description: msg`The property associated with this listing`,
    icon: 'IconHome',
    inverseSideTarget: () => PropertyWorkspaceEntity,
    inverseSideFieldKey: 'listings',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  property: Relation<PropertyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('property')
  propertyId: string | null;

  @WorkspaceRelation({
    type: RelationType.MANY_TO_ONE,
    label: msg`Agent`,
    description: msg`The agent responsible for this listing`,
    icon: 'IconUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  agent: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('agent')
  agentId: string | null;
}
