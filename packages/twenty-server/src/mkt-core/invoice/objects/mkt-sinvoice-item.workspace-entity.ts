import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { MKT_SINVOICE_ITEM_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktSInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_SINVOICE_ITEM_NAME = 'mktSInvoiceItem';
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_SINVOICE_ITEM: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktSInvoiceItem,
  namePlural: `${TABLE_SINVOICE_ITEM_NAME}s`,
  labelSingular: msg`SInvoice Item`,
  labelPlural: msg`SInvoice Items`,
  description: msg`SInvoice Item entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_SINVOICE_ITEM_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['lineNumber']])
@WorkspaceIsSearchable()
export class MktSInvoiceItemWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.lineNumber,
    type: FieldMetadataType.NUMBER,
    label: msg`Line Number`,
    description: msg`Line number`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  lineNumber?: number;
  
  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.selection,
    type: FieldMetadataType.NUMBER,
    label: msg`Selection`,
    description: msg`Selection`,
    icon: 'IconTags',
  })
  @WorkspaceIsNullable()
  selection: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.itemCode,
    type: FieldMetadataType.TEXT,
    label: msg`Item Code`,
    description: msg`Item code`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  itemCode?: string;


  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.itemName,
    type: FieldMetadataType.TEXT,
    label: msg`Item Name`,
    description: msg`Item name`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  itemName?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.unitName,
    type: FieldMetadataType.TEXT,
    label: msg`Unit Name`,
    description: msg`Unit name`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  unitName?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.quantity,
    type: FieldMetadataType.NUMBER,
    label: msg`Quantity`,
    description: msg`Quantity`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  quantity?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.unitPrice,
    type: FieldMetadataType.NUMBER,
    label: msg`Unit Price`,
    description: msg`Unit price`,
    icon: 'IconDeviceDesktop',
  })
  @WorkspaceIsNullable()
  unitPrice?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.itemTotalAmountWithoutTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Item Total Amount Without Tax`,
    description: msg`Item total amount without tax`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  itemTotalAmountWithoutTax?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.itemTotalAmountAfterDiscount,
    type: FieldMetadataType.NUMBER,
    label: msg`Item Total Amount After Discount`,
    description: msg`Item total amount after discount`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  itemTotalAmountAfterDiscount?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.itemTotalAmountWithTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Item Total Amount With Tax`,
    description: msg`Item total amount with tax`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  itemTotalAmountWithTax?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.taxPercentage,
    type: FieldMetadataType.NUMBER,
    label: msg`Tax Percentage`,
    description: msg`Tax percentage`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  taxPercentage?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.taxAmount,
    type: FieldMetadataType.NUMBER,
    label: msg`Tax Amount`,
    description: msg`Tax amount`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  taxAmount?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.discount,
    type: FieldMetadataType.NUMBER,
    label: msg`Discount`,
    description: msg`Discount`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  discount?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.itemDiscount,
    type: FieldMetadataType.NUMBER,
    label: msg`Item Discount`,
    description: msg`Item discount`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  itemDiscount?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.itemNote,
    type: FieldMetadataType.TEXT,
    label: msg`Item Note`,
    description: msg`Item note`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  itemNote?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.isIncreaseItem,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Increase Item`,
    description: msg`Is increase item`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  isIncreaseItem?: boolean;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.mktSInvoice,
    type: RelationType.MANY_TO_ONE,
    label: msg`SInvoice`,
    description: msg`SInvoice`,
    icon: 'IconBox',
    inverseSideTarget: () => MktSInvoiceWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoiceItems',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktSInvoice: Relation<MktSInvoiceWorkspaceEntity>;
  @WorkspaceJoinColumn('mktSInvoice')
  mktSInvoiceId: string;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the sinvoice item`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktSInvoiceItems',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the sinvoice item`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoiceItem',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_SINVOICE_ITEM_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_SINVOICE_ITEM,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
