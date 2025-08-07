
import {msg} from '@lingui/core/macro';

import {RelationOnDeleteAction} from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import {RelationType} from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {Relation} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {BaseWorkspaceEntity} from 'src/engine/twenty-orm/base.workspace-entity';
import {WorkspaceRelation} from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {MktAttributeWorkspaceEntity} from 'src/mkt-core/attribute/mkt-attribute.workspace-entity';
import {MktProductWorkspaceEntity} from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import {WORKSPACE_MEMBER_MKT_FIELD_IDS} from 'src/mkt-core/constants/mkt-field-ids';

export class WorkspaceMemberMktEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktProducts,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Products`,
    description: msg`Account owner for products`,
    icon: 'IconBox',
    inverseSideTarget: () => MktProductWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktProducts: Relation<MktProductWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktAttributes,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Attributes`,
    description: msg`Account owner for attributes`,
    icon: 'IconBox',
    inverseSideTarget: () => MktAttributeWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktAttributes: Relation<MktAttributeWorkspaceEntity[]>;
}
