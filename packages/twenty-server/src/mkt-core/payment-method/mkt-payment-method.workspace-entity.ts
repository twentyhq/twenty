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
import { MKT_PAYMENT_METHOD_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktPaymentWorkspaceEntity } from 'src/mkt-core/payment/mkt-payment.workspace-entity';

import { PAYMENT_METHOD_TYPE_OPTIONS } from './constants';
import { PaymentMethodType } from './types';

const SEARCH_FIELDS_FOR_PAYMENT_METHOD: FieldTypeAndNameMetadata[] = [
  { name: 'name', type: FieldMetadataType.TEXT },
  { name: 'description', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktPaymentMethod,
  namePlural: 'paymentMethods',
  labelSingular: msg`Payment Method`,
  labelPlural: msg`Payment Methods`,
  description: msg`Represents a payment method used for processing payments.`,
  icon: 'IconCreditCard',
  shortcut: 'PM',
  labelIdentifierStandardId: MKT_PAYMENT_METHOD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class MktPaymentMethodWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_PAYMENT_METHOD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Payment method name`,
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_METHOD_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Type`,
    description: msg`Payment method type`,
    options: PAYMENT_METHOD_TYPE_OPTIONS,
  })
  @WorkspaceIsNullable()
  type?: PaymentMethodType;

  @WorkspaceField({
    standardId: MKT_PAYMENT_METHOD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Payment method description`,
  })
  @WorkspaceIsNullable()
  description?: string;

  @WorkspaceField({
    standardId: MKT_PAYMENT_METHOD_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Whether the payment method is active`,
    defaultValue: true,
  })
  isActive: boolean;

  @WorkspaceField({
    standardId: MKT_PAYMENT_METHOD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_PAYMENT_METHOD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_PAYMENT_METHOD,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  @WorkspaceRelation({
    standardId: MKT_PAYMENT_METHOD_FIELD_IDS.mktPayments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Payments`,
    description: msg`Payments using this payment method`,
    icon: 'IconCash',
    inverseSideTarget: () => MktPaymentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktPayments: Relation<MktPaymentWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_PAYMENT_METHOD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;
}
