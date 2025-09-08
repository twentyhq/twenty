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
import { MKT_SINVOICE_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktSInvoiceFileWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-file.workspace-entity';
import { MktSInvoiceItemWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-item.workspace-entity';
import { MktSInvoiceMetadataWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-metadata.workspace-entity';
import { MktSInvoicePaymentWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-payment.workspace-entity';
import { MktSInvoiceTaxBreakdownWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-tax-breakdown.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_SINVOICE_NAME = 'mktSInvoice';
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_SINVOICE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktSInvoice,
  namePlural: `${TABLE_SINVOICE_NAME}s`,
  labelSingular: msg`SInvoice`,
  labelPlural: msg`SInvoices`,
  description: msg`SInvoice entity for catalog`,
  icon: 'IconBox',
  labelIdentifierStandardId: MKT_SINVOICE_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['invoiceKey']])
@WorkspaceIsSearchable()
export class MktSInvoiceWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Name`,
    description: msg`SInvoice name`,
    icon: 'IconFileText',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.invoiceType,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Type`,
    description: msg`SInvoice type`,
    icon: 'IconTags',
  })
  @WorkspaceIsNullable()
  invoiceType: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.templateCode,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Key`,
    description: msg`SInvoice key`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  templateCode?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.invoiceSeries,
    type: FieldMetadataType.TEXT,
    label: msg`SInvoice Series`,
    description: msg`SInvoice series`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  invoiceSeries?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.currencyCode,
    type: FieldMetadataType.TEXT,
    label: msg`Currency Code`,
    description: msg`Currency code`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  currencyCode?: Date;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.exchangeRate,
    type: FieldMetadataType.TEXT,
    label: msg`Exchange Rate`,
    description: msg`Exchange rate`,
    icon: 'IconDeviceDesktop',
  })
  @WorkspaceIsNullable()
  exchangeRate?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.adjustmentType,
    type: FieldMetadataType.TEXT,
    label: msg`Adjustment Type`,
    description: msg`Adjustment type`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  adjustmentType?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.paymentStatus,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Payment Status`,
    description: msg`Payment status`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  paymentStatus?: boolean;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.cusGetInvoiceRight,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Customer Get Invoice Right`,
    description: msg`Customer get invoice right`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  cusGetInvoiceRight?: boolean;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.invoiceIssuedDate,
    type: FieldMetadataType.DATE,
    label: msg`Invoice Issued Date`,
    description: msg`Invoice issued date`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  invoiceIssuedDate?: Date;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.transactionUuid,
    type: FieldMetadataType.TEXT,
    label: msg`Transaction UUID`,
    description: msg`Transaction UUID`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  transactionUuid?: string;

  //buyerInfo
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerName,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer Name`,
    description: msg`Buyer name`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerName?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerLegalName,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer Legal Name`,
    description: msg`Buyer legal name`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerLegalName?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerTaxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer Tax Code`,
    description: msg`Buyer tax code`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerTaxCode?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerAddressLine,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer Address Line`,
    description: msg`Buyer address line`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerAddressLine?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerPhoneNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer Phone Number`,
    description: msg`Buyer phone number`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerPhoneNumber?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerEmail,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer Email`,
    description: msg`Buyer email`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerEmail?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerIdNo,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer ID No`,
    description: msg`Buyer ID no`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerIdNo?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerIdType,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer ID Type`,
    description: msg`Buyer ID type`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerIdType?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.buyerNotGetInvoice,
    type: FieldMetadataType.TEXT,
    label: msg`Buyer Not Get Invoice`,
    description: msg`Buyer not get invoice`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  buyerNotGetInvoice?: string;

  //summarizeInfo
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.sumOfTotalLineAmountWithoutTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Sum of Total Line Amount Without Tax`,
    description: msg`Sum of total line amount without tax`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  sumOfTotalLineAmountWithoutTax?: number;
  
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.totalAmountAfterDiscount,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Amount After Discount`,
    description: msg`Total amount after discount`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  totalAmountAfterDiscount?: number;
  
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.totalAmountWithoutTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Amount Without Tax`,
    description: msg`Total amount without tax`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  totalAmountWithoutTax?: number;
  
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.totalTaxAmount,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Tax Amount`,
    description: msg`Total tax amount`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  totalTaxAmount?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.totalAmountWithTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Amount With Tax`,
    description: msg`Total amount with tax`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  totalAmountWithTax?: number;
  
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.totalAmountWithTaxInWords,
    type: FieldMetadataType.TEXT,
    label: msg`Total Amount With Tax In Words`,
    description: msg`Total amount with tax in words`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  totalAmountWithTaxInWords?: string;
  
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.discountAmount,
    type: FieldMetadataType.NUMBER,
    label: msg`Discount Amount`,
    description: msg`Discount amount`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  discountAmount?: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Description`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  description?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.supplierTaxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Supplier Tax Code`,
    description: msg`Supplier tax code`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  supplierTaxCode?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.invoiceNo,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice No`,
    description: msg`Invoice no`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  invoiceNo?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.transactionID,
    type: FieldMetadataType.TEXT,
    label: msg`Transaction ID`,
    description: msg`Transaction id`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  transactionID?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.reservationCode,
    type: FieldMetadataType.TEXT,
    label: msg`Reservation Code`,
    description: msg`Reservation code`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  reservationCode?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.codeOfTax,
    type: FieldMetadataType.TEXT,
    label: msg`Code of Tax`,
    description: msg`Code of tax`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  codeOfTax?: string;

  //errors
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.errorCode,
    type: FieldMetadataType.TEXT,
    label: msg`Error Code`,
    description: msg`Error code`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  errorCode?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.errorMessage,
    type: FieldMetadataType.TEXT,
    label: msg`Error Message`,
    description: msg`Error message`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  errorMessage?: string;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.errorData,
    type: FieldMetadataType.TEXT,
    label: msg`Error Data`,
    description: msg`Error data`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  errorData?: string;

  //common relations or fields
  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FIELD_IDS.mktSInvoicePayments,
    type: RelationType.ONE_TO_MANY,
    label: msg`SInvoice Payments`,
    description: msg`SInvoice payments`,
    icon: 'IconPayment',
    inverseSideTarget: () => MktSInvoicePaymentWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoice',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktSInvoicePayments: Relation<MktSInvoicePaymentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FIELD_IDS.mktSInvoiceItems,
    type: RelationType.ONE_TO_MANY,
    label: msg`SInvoice Items`,
    description: msg`SInvoice items`,
    icon: 'IconItems',
    inverseSideTarget: () => MktSInvoiceItemWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoice',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktSInvoiceItems: Relation<MktSInvoiceItemWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FIELD_IDS.mktSInvoiceTaxBreakdowns,
    type: RelationType.ONE_TO_MANY,
    label: msg`SInvoice Tax Breakdowns`,
    description: msg`SInvoice tax breakdowns`,
    icon: 'IconTax',
    inverseSideTarget: () => MktSInvoiceTaxBreakdownWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoice',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktSInvoiceTaxBreakdowns: Relation<MktSInvoiceTaxBreakdownWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FIELD_IDS.mktSInvoiceMetadata,
    type: RelationType.ONE_TO_MANY,
    label: msg`SInvoice Metadata`,
    description: msg`SInvoice metadata`,
    icon: 'IconMetadata',
    inverseSideTarget: () => MktSInvoiceMetadataWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoice',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktSInvoiceMetadata: Relation<MktSInvoiceMetadataWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FIELD_IDS.mktSInvoiceFiles,
    type: RelationType.ONE_TO_MANY,
    label: msg`SInvoice Files`,
    description: msg`SInvoice files`,
    icon: 'IconFile',
    inverseSideTarget: () => MktSInvoiceFileWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoice',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktSInvoiceFiles: Relation<MktSInvoiceFileWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FIELD_IDS.mktOrder,
    type: RelationType.MANY_TO_ONE,
    label: msg`Order`,
    description: msg`Order linked to the sinvoice`,
    icon: 'IconShoppingCart',
    inverseSideTarget: () => MktOrderWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoice',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktOrder: Relation<MktOrderWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktOrder')
  mktOrderId: string | null;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the sinvoice`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktSInvoices',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_SINVOICE_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the sinvoice`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktSInvoice',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_SINVOICE_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_SINVOICE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
