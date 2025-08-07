import {msg} from '@lingui/core/macro';

import {RelationOnDeleteAction} from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import {RelationType} from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {Relation} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {BaseWorkspaceEntity} from 'src/engine/twenty-orm/base.workspace-entity';
import {WorkspaceIsNullable} from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import {WorkspaceJoinColumn} from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import {WorkspaceRelation} from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {MktCustomerWorkspaceEntity} from 'src/mkt-core/mkt-example/libs/customers/entities/customer.workspace-entity';
import {MktProductWorkspaceEntity} from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import {TIMELINE_ACTIVITY_MKT_FIELD_IDS} from 'src/mkt-core/constants/mkt-field-ids';

export class TimelineActivityMktEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktCustomer,
    type: RelationType.MANY_TO_ONE,
    label: msg`Customer`,
    description: msg`Event customer`,
    icon: 'IconUser',
    inverseSideTarget: () => MktCustomerWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktCustomer: Relation<MktCustomerWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktCustomer')
  mktCustomerId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktProduct,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Event product`,
    icon: 'IconBox',
    inverseSideTarget: () => MktProductWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktProduct: Relation<MktProductWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktProduct')
  mktProductId: string | null;
}
