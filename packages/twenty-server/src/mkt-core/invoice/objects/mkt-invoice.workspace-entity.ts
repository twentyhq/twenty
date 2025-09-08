import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
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
import { MKT_INVOICE_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';
import { MktTemplateWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-template.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_INVOICE_NAME = 'mktInvoice';
const NAME_FIELD_NAME = 'name';
const INVOICE_CODE_FIELD_NAME = 'sInvoiceCode';

export const SEARCH_FIELDS_FOR_MKT_INVOICE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: INVOICE_CODE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum MKT_INVOICE_STATUS {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export const MKT_INVOICE_STATUS_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_INVOICE_STATUS.DRAFT,
    label: 'Active',
    position: 0,
    color: 'blue',
  },
  {
    value: MKT_INVOICE_STATUS.SENT,
    label: 'Sent',
    position: 1,
    color: 'purple',
  },
  {
    value: MKT_INVOICE_STATUS.PAID,
    label: 'Paid',
    position: 2,
    color: 'green',
  },
  {
    value: MKT_INVOICE_STATUS.CANCELLED,
    label: 'Cancelled',
    position: 3,
    color: 'orange',
  },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktInvoice,
  namePlural: `${TABLE_INVOICE_NAME}s`,
  labelSingular: msg`Invoice`,
  labelPlural: msg`Invoices`,
  description: msg`Invoice entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_INVOICE_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['sInvoiceCode']])
@WorkspaceIsSearchable()
export class MktInvoiceWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice Name`,
    description: msg`Invoice name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.amount,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice Amount`,
    description: msg`Invoice amount`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  amount?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Invoice Status`,
    description: msg`Invoice status (draft, sent, paid, cancelled)`,
    icon: 'IconTags',
    options: MKT_INVOICE_STATUS_OPTIONS,
  })
  @WorkspaceIsNullable()
  status: MKT_INVOICE_STATUS;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.vat,
    type: FieldMetadataType.NUMBER,
    label: msg`Invoice VAT`,
    description: msg`Invoice VAT`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  vat?: number;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.sInvoiceCode,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice Code`,
    description: msg`Invoice code`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  sInvoiceCode?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.sentAt,
    type: FieldMetadataType.TEXT,
    label: msg`Sent At`,
    description: msg`Invoice sent at`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  sentAt?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.supplierTaxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Supplier Tax Code`,
    description: msg`Supplier tax code`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  supplierTaxCode?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.invoiceType,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice Type`,
    description: msg`Invoice type`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  invoiceType?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.templateCode,
    type: FieldMetadataType.TEXT,
    label: msg`Template Code`,
    description: msg`Template code`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  templateCode?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.invoiceSeries,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice Series`,
    description: msg`Invoice series`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  invoiceSeries?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.invoiceNo,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice No`,
    description: msg`Invoice no`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  invoiceNo?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.transactionUuid,
    type: FieldMetadataType.TEXT,
    label: msg`Transaction UUID`,
    description: msg`Transaction UUID`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  transactionUuid?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.issueDate,
    type: FieldMetadataType.TEXT,
    label: msg`Issue Date`,
    description: msg`Issue date`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  issueDate?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.totalWithoutTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Without Tax`,
    description: msg`Total without tax`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  totalWithoutTax?: number;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.totalTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Tax`,
    description: msg`Total tax`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  totalTax?: number;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.totalWithTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Total With Tax`,
    description: msg`Total with tax`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  totalWithTax?: number;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.taxInWords,
    type: FieldMetadataType.TEXT,
    label: msg`Tax In Words`,
    description: msg`Tax in words`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  taxInWords?: string;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.totalAmount,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Amount`,
    description: msg`Invoice total amount`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  totalAmount?: number;

  @WorkspaceRelation({
    standardId: MKT_INVOICE_FIELD_IDS.mktOrder,
    type: RelationType.MANY_TO_ONE,
    label: msg`Order`,
    description: msg`Invoice order`,
    icon: 'IconShoppingCart',
    inverseSideTarget: () => MktOrderWorkspaceEntity,
    inverseSideFieldKey: 'mktInvoices',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktOrder: Relation<MktOrderWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktOrder')
  mktOrderId: string | null;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_INVOICE_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the invoice`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktInvoices',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_INVOICE_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the invoice`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktInvoice',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_INVOICE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_INVOICE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  @WorkspaceRelation({
    standardId: MKT_INVOICE_FIELD_IDS.mktTemplate,
    type: RelationType.MANY_TO_ONE,
    label: msg`Template`,
    description: msg`Invoice template`,
    icon: 'IconBox',
    inverseSideTarget: () => MktTemplateWorkspaceEntity,
    inverseSideFieldKey: 'mktInvoices',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktTemplate: Relation<MktTemplateWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktTemplate')
  mktTemplateId: string | null;
}
