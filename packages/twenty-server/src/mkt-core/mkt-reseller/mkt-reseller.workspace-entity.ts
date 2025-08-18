import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MKT_RESELLER_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktResellerTierWorkspaceEntity } from 'src/mkt-core/mkt-reseller-tier/mkt-reseller-tier';

export enum RESELLER_STATUS {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktReseller,
  namePlural: 'mktResellers',
  labelSingular: msg`Reseller`,
  labelPlural: msg`Resellers`,
  description: msg`Represents a reseller in the marketing system.`,
  icon: 'IconBuilding',
  shortcut: 'S',
})
@WorkspaceIsSearchable()
export class MktResellerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.companyName,
    type: FieldMetadataType.TEXT,
    label: msg`Company Name`,
    description: msg`Name of the reseller company`,
    icon: 'IconBuilding',
  })
  companyName: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.companyShortName,
    type: FieldMetadataType.TEXT,
    label: msg`Company Short Name`,
    description: msg`Short name or abbreviation of the company`,
    icon: 'IconBuildingBank',
  })
  @WorkspaceIsNullable()
  companyShortName?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.taxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Tax Code`,
    description: msg`Tax identification number of the company`,
    icon: 'IconReceipt2',
  })
  @WorkspaceIsNullable()
  taxCode?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.legalRepresentativeName,
    type: FieldMetadataType.TEXT,
    label: msg`Legal Representative Name`,
    description: msg`Name of the legal representative`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  legalRepresentativeName?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.contactEmail,
    type: FieldMetadataType.TEXT,
    label: msg`Contact Email`,
    description: msg`Primary contact email of the reseller`,
    icon: 'IconMail',
  })
  contactEmail: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.contactPhone,
    type: FieldMetadataType.TEXT,
    label: msg`Contact Phone`,
    description: msg`Primary contact phone number`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  contactPhone?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.address,
    type: FieldMetadataType.TEXT,
    label: msg`Address`,
    description: msg`Business address of the reseller`,
    icon: 'IconMap',
  })
  @WorkspaceIsNullable()
  address?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.commitmentAmount,
    type: FieldMetadataType.NUMBER,
    label: msg`Commitment Amount`,
    description: msg`Annual sales commitment amount`,
    icon: 'IconCurrency',
  })
  @WorkspaceIsNullable()
  commitmentAmount?: number;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.commissionRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Commission Rate`,
    description: msg`Commission rate percentage for this reseller`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  commissionRate?: number;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.subdomain,
    type: FieldMetadataType.TEXT,
    label: msg`Subdomain`,
    description: msg`Unique subdomain for the reseller`,
    icon: 'IconWorld',
  })
  subdomain: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.customDomain,
    type: FieldMetadataType.TEXT,
    label: msg`Custom Domain`,
    description: msg`Optional custom domain for the reseller`,
    icon: 'IconWorldWww',
  })
  @WorkspaceIsNullable()
  customDomain?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.isCustomDomainEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Custom Domain Enabled`,
    description: msg`Whether custom domain is enabled`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  isCustomDomainEnabled?: boolean;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Current status of the reseller`,
    icon: 'IconCircleDot',
    options: [
      {
        value: RESELLER_STATUS.PENDING,
        label: 'Pending',
        position: 0,
        color: 'yellow',
      },
      {
        value: RESELLER_STATUS.ACTIVE,
        label: 'Active',
        position: 1,
        color: 'green',
      },
      {
        value: RESELLER_STATUS.SUSPENDED,
        label: 'Suspended',
        position: 2,
        color: 'orange',
      },
      {
        value: RESELLER_STATUS.TERMINATED,
        label: 'Terminated',
        position: 3,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsNullable()
  status?: RESELLER_STATUS;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.actualRevenue,
    type: FieldMetadataType.NUMBER,
    label: msg`Actual Revenue`,
    description: msg`Actual revenue achieved by the reseller`,
    icon: 'IconCurrency',
  })
  @WorkspaceIsNullable()
  actualRevenue?: number;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.lastRevenueUpdate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last Revenue Update`,
    description: msg`Last time revenue was updated`,
    icon: 'IconCalendarClock',
  })
  @WorkspaceIsNullable()
  lastRevenueUpdate?: string;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_RESELLER_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_RESELLER_FIELD_IDS.currentTierId,
    type: RelationType.MANY_TO_ONE,
    label: msg`Current Tier`,
    description: msg`Current tier level of the reseller`,
    icon: 'IconStar',
    inverseSideTarget: () => MktResellerTierWorkspaceEntity,
    inverseSideFieldKey: 'resellers',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  currentTier: Relation<MktResellerTierWorkspaceEntity> | null;

  @WorkspaceJoinColumn('currentTier')
  currentTierId: string | null;
}
