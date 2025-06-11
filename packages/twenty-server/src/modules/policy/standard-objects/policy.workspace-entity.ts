import { msg } from '@lingui/core/macro';
import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { POLICY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CarrierWorkspaceEntity } from 'src/modules/carrier/standard-objects/carrier.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { MGAWorkspaceEntity } from 'src/modules/mga/standard-objects/mga.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

export enum PolicyStatus {
  ACTIVE = 'Active',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired',
  PENDING = 'Pending',
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  PARTIAL = 'Partial',
  OVERDUE = 'Overdue',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.policy,
  namePlural: 'policies',
  labelSingular: msg`Policy`,
  labelPlural: msg`Policies`,
  description: msg`An insurance policy`,
  icon: STANDARD_OBJECT_ICONS.policy,
  labelIdentifierStandardId: POLICY_STANDARD_FIELD_IDS.policyNumber,
})
@WorkspaceDuplicateCriteria([['policyNumber']])
@WorkspaceIsSearchable()
export class PolicyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.policyNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Policy Number`,
    description: msg`The policy number`,
    icon: 'IconHash',
  })
  @WorkspaceIsUnique()
  policyNumber: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`The policy position`,
    icon: 'IconNumber',
    defaultValue: 0,
  })
  position: number;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`The policy status`,
    icon: 'IconStatusChange',
    options: [
      { value: PolicyStatus.ACTIVE, label: 'Active', position: 0, color: 'green' },
      { value: PolicyStatus.CANCELLED, label: 'Cancelled', position: 1, color: 'red' },
      { value: PolicyStatus.EXPIRED, label: 'Expired', position: 2, color: 'orange' },
      { value: PolicyStatus.PENDING, label: 'Pending', position: 3, color: 'blue' },
    ],
    defaultValue: `'${PolicyStatus.PENDING}'`,
  })
  status: PolicyStatus;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.effectiveDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Effective Date`,
    description: msg`The policy effective date`,
    icon: 'IconCalendar',
  })
  effectiveDate: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.expirationDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Expiration Date`,
    description: msg`The policy expiration date`,
    icon: 'IconCalendar',
  })
  expirationDate: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.bindDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Bind Date`,
    description: msg`The policy bind date`,
    icon: 'IconCalendar',
  })
  bindDate: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.binderId,
    type: FieldMetadataType.TEXT,
    label: msg`Binder ID`,
    description: msg`The policy binder ID`,
    icon: 'IconHash',
  })
  binderId: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.businessType,
    type: FieldMetadataType.TEXT,
    label: msg`Business Type`,
    description: msg`The business type`,
    icon: 'IconBriefcase',
  })
  businessType: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.businessSubType,
    type: FieldMetadataType.TEXT,
    label: msg`Business Sub Type`,
    description: msg`The business sub type`,
    icon: 'IconBriefcase',
  })
  @WorkspaceIsNullable()
  businessSubType: string;

  // @WorkspaceField({
  //   standardId: POLICY_STANDARD_FIELD_IDS.insuredBusinessType,
  //   type: FieldMetadataType.TEXT,
  //   label: msg`Insured Business Type`,
  //   description: msg`The insured business type`,
  //   icon: 'IconBriefcase',
  // })
  // insuredBusinessType: string;

  // @WorkspaceField({
  //   standardId: POLICY_STANDARD_FIELD_IDS.insuredType,
  //   type: FieldMetadataType.TEXT,
  //   label: msg`Insured Type`,
  //   description: msg`The insured type`,
  //   icon: 'IconUser',
  // })
  // insuredType: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.cancellationDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Cancellation Date`,
    description: msg`The policy cancellation date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  cancellationDate: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.billingType,
    type: FieldMetadataType.TEXT,
    label: msg`Billing Type`,
    description: msg`The billing type`,
    icon: 'IconCreditCard',
  })
  billingType: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.paymentStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Payment Status`,
    description: msg`The payment status`,
    icon: 'IconCreditCard',
    options: [
      { value: PaymentStatus.PAID, label: 'Paid', position: 0, color: 'green' },
      { value: PaymentStatus.UNPAID, label: 'Unpaid', position: 1, color: 'red' },
      { value: PaymentStatus.PARTIAL, label: 'Partial', position: 2, color: 'orange' },
      { value: PaymentStatus.OVERDUE, label: 'Overdue', position: 3, color: 'red' },
    ],
    defaultValue: `'${PaymentStatus.UNPAID}'`,
  })
  paymentStatus: PaymentStatus;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.autoRenew,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Auto Renew`,
    description: msg`Whether the policy auto renews`,
    icon: 'IconRefresh',
    defaultValue: false,
  })
  autoRenew: boolean;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.mortgageeBilled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Mortgagee Billed`,
    description: msg`Whether the mortgagee is billed`,
    icon: 'IconCreditCard',
    defaultValue: false,
  })
  mortgageeBilled: boolean;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.changeDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Change Date`,
    description: msg`The policy change date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  changeDate: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.createDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Create Date`,
    description: msg`The policy create date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  createDate: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.hasEndorsement,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Has Endorsement`,
    description: msg`Whether the policy has endorsements`,
    icon: 'IconFileText',
    defaultValue: false,
  })
  hasEndorsement: boolean;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.hasAgentCommission,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Has Agent Commission`,
    description: msg`Whether the policy has agent commission`,
    icon: 'IconMoney',
    defaultValue: false,
  })
  hasAgentCommission: boolean;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.hasAgencyCommission,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Has Agency Commission`,
    description: msg`Whether the policy has agency commission`,
    icon: 'IconMoney',
    defaultValue: false,
  })
  hasAgencyCommission: boolean;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.lineOfBusinessClass,
    type: FieldMetadataType.TEXT,
    label: msg`Line of Business Class`,
    description: msg`The line of business class`,
    icon: 'IconBriefcase',
  })
  @WorkspaceIsNullable()
  lineOfBusinessClass: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.lineOfBusiness,
    type: FieldMetadataType.TEXT,
    label: msg`Line of Business`,
    description: msg`The line of business`,
    icon: 'IconBriefcase',
  })
  lineOfBusiness: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.productName,
    type: FieldMetadataType.TEXT,
    label: msg`Product Name`,
    description: msg`The product name`,
    icon: 'IconPackage',
  })
  @WorkspaceIsNullable()
  productName: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.policyUrl,
    type: FieldMetadataType.LINKS,
    label: msg`Policy URL`,
    description: msg`The policy URL`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  policyUrl: LinksMetadata;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.location,
    type: FieldMetadataType.TEXT,
    label: msg`Location`,
    description: msg`The policy location`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  location: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.agent,
    type: FieldMetadataType.TEXT,
    label: msg`Agent`,
    description: msg`The policy agent`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  agent: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.coverages,
    type: FieldMetadataType.TEXT,
    label: msg`Coverages`,
    description: msg`The policy coverages`,
    icon: 'IconShield',
  })
  @WorkspaceIsNullable()
  coverages: string[];

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.referralSource,
    type: FieldMetadataType.TEXT,
    label: msg`Referral Source`,
    description: msg`The policy referral source`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  referralSource: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.financeCompany,
    type: FieldMetadataType.TEXT,
    label: msg`Finance Company`,
    description: msg`The finance company`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  financeCompany: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.zipCode,
    type: FieldMetadataType.TEXT,
    label: msg`Zip Code`,
    description: msg`The zip code`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  zipCode: string;

  // @WorkspaceField({
  //   standardId: POLICY_STANDARD_FIELD_IDS.insuredTag,
  //   type: FieldMetadataType.TEXT,
  //   label: msg`Insured Tag`,
  //   description: msg`The insured tag`,
  //   icon: 'IconTag',
  // })
  // @WorkspaceIsNullable()
  // insuredTag: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.workGroups,
    type: FieldMetadataType.TEXT,
    label: msg`Work Groups`,
    description: msg`The work groups`,
    icon: 'IconUsers',
  })
  @WorkspaceIsNullable()
  workGroups: string[];

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.tag,
    type: FieldMetadataType.TEXT,
    label: msg`Tag`,
    description: msg`The policy tag`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  tag: string;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.premium,
    type: FieldMetadataType.NUMBER,
    label: msg`Premium`,
    description: msg`The policy premium`,
    icon: 'IconMoney',
  })
  @WorkspaceIsNullable()
  premium: number;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.nonPremium,
    type: FieldMetadataType.NUMBER,
    label: msg`Non Premium`,
    description: msg`The policy non premium`,
    icon: 'IconMoney',
  })
  @WorkspaceIsNullable()
  nonPremium: number;

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.deductibles,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Deductibles`,
    description: msg`The policy deductibles`,
    icon: 'IconMoney',
  })
  @WorkspaceIsNullable()
  deductibles: { type: string; amount: number }[];

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.limits,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Limits`,
    description: msg`The policy limits`,
    icon: 'IconMoney',
  })
  @WorkspaceIsNullable()
  limits: { type: string; amount: number }[];

  @WorkspaceField({
    standardId: POLICY_STANDARD_FIELD_IDS.endorsements,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Endorsements`,
    description: msg`The policy endorsements`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  endorsements: { id: string; type: string; effectiveDate: string; description: string }[];

  // // Relations
  // @WorkspaceRelation({
  //   standardId: POLICY_STANDARD_FIELD_IDS.insured,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Insured`,
  //   description: msg`The policy insured`,
  //   icon: 'IconUser',
  //   inverseSideTarget: () => InsuredWorkspaceEntity,
  //   inverseSideFieldKey: 'policies',
  //   onDelete: RelationOnDeleteAction.CASCADE,
  // })
  // insured: Relation<InsuredWorkspaceEntity>;

  // @WorkspaceJoinColumn('insured')
  // insuredId: string;

  @WorkspaceRelation({
    standardId: POLICY_STANDARD_FIELD_IDS.carrier,
    type: RelationType.MANY_TO_ONE,
    label: msg`Carrier`,
    description: msg`The policy carrier`,
    icon: 'IconBuilding',
    inverseSideTarget: () => CarrierWorkspaceEntity,
    inverseSideFieldKey: 'policies',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  carrier: Relation<CarrierWorkspaceEntity>;

  @WorkspaceJoinColumn('carrier')
  carrierId: string;

  // @WorkspaceRelation({
  //   standardId: POLICY_STANDARD_FIELD_IDS.parentCarrier,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Parent Carrier`,
  //   description: msg`The policy parent carrier`,
  //   icon: 'IconBuilding',
  //   inverseSideTarget: () => ParentCarrierWorkspaceEntity,
  //   inverseSideFieldKey: 'policies',
  //   onDelete: RelationOnDeleteAction.CASCADE,
  // })
  // parentCarrier: Relation<ParentCarrierWorkspaceEntity>;

  // @WorkspaceJoinColumn('parentCarrier')
  // parentCarrierId: string;

  @WorkspaceRelation({
    standardId: POLICY_STANDARD_FIELD_IDS.mga,
    type: RelationType.MANY_TO_ONE,
    label: msg`MGA`,
    description: msg`The policy MGA`,
    icon: 'IconBuilding',
    inverseSideTarget: () => MGAWorkspaceEntity,
    inverseSideFieldKey: 'policies',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mga: Relation<MGAWorkspaceEntity>;

  @WorkspaceJoinColumn('mga')
  mgaId: string;

  @WorkspaceRelation({
    standardId: POLICY_STANDARD_FIELD_IDS.accountManager,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Manager`,
    description: msg`The policy account manager`,
    icon: 'IconUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'managedPolicies',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountManager: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('accountManager')
  accountManagerId: string;

  @WorkspaceRelation({
    standardId: POLICY_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the policy`,
    icon: 'IconTimeline',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'policy',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceJoinColumn('timelineActivities')
  timelineActivitiesId: string;

  @WorkspaceRelation({
    standardId: POLICY_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the policy`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    inverseSideFieldKey: 'policy',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: POLICY_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the policy`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    inverseSideFieldKey: 'policy',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceJoinColumn('attachments')
  attachmentsId: string;

  @WorkspaceRelation({
    standardId: POLICY_STANDARD_FIELD_IDS.notes,
    type: RelationType.ONE_TO_MANY,
    label: msg`Notes`,
    description: msg`Notes linked to the policy`,
    icon: 'IconNote',
    inverseSideTarget: () => NoteWorkspaceEntity,
    inverseSideFieldKey: 'policy',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  notes: Relation<NoteWorkspaceEntity[]>;

  @WorkspaceJoinColumn('notes')
  notesId: string;
} 