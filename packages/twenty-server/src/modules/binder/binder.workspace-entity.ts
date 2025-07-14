import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { PersonWorkspaceEntity } from '../person/standard-objects/person.workspace-entity';
import { ListingWorkspaceEntity } from '../listing/standard-objects/listing.workspace-entity';
import { DocumentWorkspaceEntity } from '../document-library/document.workspace-entity';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';

@WorkspaceEntity({
  name: 'binder',
  namePlural: 'binders',
  labelSingular: msg`Binder`,
  labelPlural: msg`Binders`,
  description: msg`A binder of documents and listings for a client`,
  icon: 'IconBook',
})
export class BinderWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The binder name`,
    icon: 'IconBook',
  })
  name: string;

  @WorkspaceRelation({
    type: RelationType.MANY_TO_ONE,
    label: msg`Client`,
    description: msg`The client for this binder`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  client: Relation<PersonWorkspaceEntity>;

  @WorkspaceJoinColumn('client')
  clientId: string;

  @WorkspaceRelation({
    type: RelationType.MANY_TO_MANY,
    label: msg`Listings`,
    description: msg`The listings in this binder`,
    icon: 'IconTag',
    inverseSideTarget: () => ListingWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  listings: Relation<ListingWorkspaceEntity[]>;

  @WorkspaceRelation({
    type: RelationType.MANY_TO_MANY,
    label: msg`Documents`,
    description: msg`The documents in this binder`,
    icon: 'IconFile',
    inverseSideTarget: () => DocumentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  documents: Relation<DocumentWorkspaceEntity[]>;
}
