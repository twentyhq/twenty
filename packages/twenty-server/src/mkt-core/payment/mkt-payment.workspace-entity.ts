import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { MKT_PAYMENT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktPaymentMethodWorkspaceEntity } from 'src/mkt-core/payment-method/mkt-payment-method.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';

import { PAYMENT_STATUS_OPTIONS } from './constants';
import { PaymentStatus } from './types';

const SEARCH_FIELDS_FOR_PAYMENT: FieldTypeAndNameMetadata[] = [
  { name: 'name', type: FieldMetadataType.TEXT },
  { name: 'description', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktPayment,
  namePlural: 'payments',
  labelSingular: msg`Payment`,
  labelPlural: msg`Payments`,
  description: msg`Represents a payment transaction.`,
  icon: 'IconCash',
  shortcut: 'P',
  labelIdentifierStandardId: MKT_PAYMENT_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class MktPaymentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Payment name or reference`,
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.amount,
    type: FieldMetadataType.NUMBER,
    label: msg`Amount`,
    description: msg`Payment amount`,
  })
  amount: number;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.currency,
    type: FieldMetadataType.TEXT,
    label: msg`Currency`,
    description: msg`Payment currency`,
    defaultValue: "'USD'",
  })
  currency: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Payment status`,
    options: PAYMENT_STATUS_OPTIONS,
  })
  @WorkspaceIsNullable()
  status?: PaymentStatus;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.paymentDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Payment Date`,
    description: msg`Date and time when payment was made`,
  })
  @WorkspaceIsNullable()
  paymentDate?: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Payment description or notes`,
  })
  @WorkspaceIsNullable()
  description?: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.orderId,
    type: FieldMetadataType.TEXT,
    label: msg`Order ID`,
    description: msg`Associated order ID (nullable)`,
  })
  @WorkspaceIsNullable()
  orderId?: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.invoiceId,
    type: FieldMetadataType.TEXT,
    label: msg`Invoice ID`,
    description: msg`Associated invoice ID (nullable)`,
  })
  @WorkspaceIsNullable()
  invoiceId?: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceRelation({
    standardId: MKT_PAYMENT_FIELD_IDS.mktPaymentMethod,
    type: RelationType.MANY_TO_ONE,
    label: msg`Payment Method`,
    description: msg`Payment method used for this payment`,
    icon: 'IconCreditCard',
    inverseSideTarget: () => MktPaymentMethodWorkspaceEntity,
    inverseSideFieldKey: 'mktPayments',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktPaymentMethod: Relation<MktPaymentMethodWorkspaceEntity>;

  @WorkspaceJoinColumn('mktPaymentMethod')
  mktPaymentMethodId: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_PAYMENT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;
}
