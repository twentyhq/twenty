import { ManyToOne } from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { CHARGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { FieldMetadataType } from 'twenty-shared';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { FieldTypeAndNameMetadata, getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IntegrationWorkspaceEntity } from 'src/modules/integrations/standard-objects/integration.workspace-entity';

const NAME_FIELD_NAME = 'product';

export const SEARCH_FIELDS_FOR_CHARGE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.charge,
  namePlural: 'charges',
  labelSingular: 'Charge',
  labelPlural: 'Charges',
  description: 'A charge',
  icon: 'IconSettings',
  labelIdentifierStandardId: CHARGE_STANDARD_FIELD_IDS.product,
})
@WorkspaceIsNotAuditLogged()
export class ChargeWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.product,
    type: FieldMetadataType.TEXT,
    label: 'Product',
    description: 'Charge product',
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  product: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.price,
    type: FieldMetadataType.NUMBER,
    label: 'Price',
    description: 'Charge price',
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  price: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.quantity,
    type: FieldMetadataType.NUMBER,
    label: 'Quantity',
    description: 'Charge quantity',
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  quantity: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.discount,
    type: FieldMetadataType.NUMBER,
    label: 'Discount',
    description: 'Charge discount',
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  discount: number;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.recurrence,
    type: FieldMetadataType.SELECT,
    label: 'Recurrence',
    description: 'Charge recurrence',
    icon: 'IconSettings',
    options: [
      { value: 'None', label: 'None', position: 0, color: 'gray' },
      { value: 'Annual', label: 'Annual', position: 1, color: 'gray' },
      {
        value: 'Monthly', label: 'Monthly', position: 2, color: 'gray' },
    ],
  })
  @WorkspaceIsNullable()
  recurrence: string;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Charge record position',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  //Relations
  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.customer,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Customer',
    description: 'Company linked to the charge',
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'charges',
  })
  @WorkspaceIsNullable()
  @ManyToOne(() => CompanyWorkspaceEntity, (company) => company.charges, {
    nullable: true,
  })
  company: CompanyWorkspaceEntity | null;
  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.integration,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'PaymentGateway',
    description: 'Integration linked to the charge',
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => IntegrationWorkspaceEntity,
    inverseSideFieldKey: 'charges',
  })
  @WorkspaceIsNullable()
  @ManyToOne(
    () => IntegrationWorkspaceEntity,
    (integration) => integration.charges,
    {
      nullable: true,
    },
  )
  integration: IntegrationWorkspaceEntity | null;
  @WorkspaceJoinColumn('integration')
  integrationId: string | null;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.people,
    type: RelationMetadataType.ONE_TO_ONE,
    label: 'Contact',
    description: 'Person linked to the charge',
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  people: Relation<PersonWorkspaceEntity>;
  @WorkspaceJoinColumn('people')
  peopleId: string;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Events',
    description: 'Events linked to the person',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: CHARGE_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Attachments',
    description: 'Attachments linked to the opportunity',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: CHARGE_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_CHARGE,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  [SEARCH_VECTOR_FIELD.name]: any;
}
