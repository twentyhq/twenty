import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { AddressMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/address.composite-type';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { EmailsMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/emails.composite-type';
import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { PhonesMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';
const DOMAIN_NAME_FIELD_NAME = 'domainName';

export const SEARCH_FIELDS_FOR_COMPANY: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: DOMAIN_NAME_FIELD_NAME, type: FieldMetadataType.LINKS },
];

export enum CompanyDemoSelect {
  OPTION_SINGLE_1 = 'OPTION_SINGLE_1',
  OPTION_SINGLE_2 = 'OPTION_SINGLE_2',
  OPTION_SINGLE_3 = 'OPTION_SINGLE_3',
  OPTION_SINGLE_4 = 'OPTION_SINGLE_4',
}

export enum CompanyDemoMultiSelect {
  OPTION_MULTI_1 = 'OPTION_MULTI_1',
  OPTION_MULTI_2 = 'OPTION_MULTI_2',
  OPTION_MULTI_3 = 'OPTION_MULTI_3',
  OPTION_MULTI_4 = 'OPTION_MULTI_4',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.company,
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  description: 'A company',
  icon: STANDARD_OBJECT_ICONS.company,
  shortcut: 'C',
  labelIdentifierStandardId: COMPANY_STANDARD_FIELD_IDS.name,
})
export class CompanyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The company name',
    icon: 'IconBuildingSkyscraper',
  })
  [NAME_FIELD_NAME]: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.domainName,
    type: FieldMetadataType.LINKS,
    label: 'Domain Name',
    description:
      'The company website URL. We use this url to fetch the company icon',
    icon: 'IconLink',
  })
  @WorkspaceIsUnique()
  [DOMAIN_NAME_FIELD_NAME]?: LinksMetadata;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.employees,
    type: FieldMetadataType.NUMBER,
    label: 'Employees',
    description: 'Number of employees in the company',
    icon: 'IconUsers',
  })
  @WorkspaceIsNullable()
  employees: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.linkedinLink,
    type: FieldMetadataType.LINKS,
    label: 'Linkedin',
    description: 'The company Linkedin account',
    icon: 'IconBrandLinkedin',
  })
  @WorkspaceIsNullable()
  linkedinLink: LinksMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.xLink,
    type: FieldMetadataType.LINKS,
    label: 'X',
    description: 'The company Twitter/X account',
    icon: 'IconBrandX',
  })
  @WorkspaceIsNullable()
  xLink: LinksMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
    type: FieldMetadataType.CURRENCY,
    label: 'ARR',
    description:
      'Annual Recurring Revenue: The actual or estimated annual revenue of the company',
    icon: 'IconMoneybag',
  })
  @WorkspaceIsNullable()
  annualRecurringRevenue: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.address,
    type: FieldMetadataType.ADDRESS,
    label: 'Address',
    description: 'Address of the company',
    icon: 'IconMap',
  })
  @WorkspaceIsNullable()
  address: AddressMetadata;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.idealCustomerProfile,
    type: FieldMetadataType.BOOLEAN,
    label: 'ICP',
    description:
      'Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you',
    icon: 'IconTarget',
    defaultValue: false,
  })
  idealCustomerProfile: boolean;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Company record position',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: 'Created by',
    icon: 'IconCreativeCommonsSa',
    description: 'The creator of the record',
    defaultValue: {
      source: `'${FieldActorSource.MANUAL}'`,
      name: "''",
    },
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.people,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'People',
    description: 'People linked to the company.',
    icon: 'IconUsers',
    inverseSideTarget: () => PersonWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  people: Relation<PersonWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.accountOwner,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Account Owner',
    description:
      'Your team member responsible for managing the company account',
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForCompanies',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.taskTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Tasks',
    description: 'Tasks tied to the company',
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.noteTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Notes',
    description: 'Notes tied to the company',
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.opportunities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Opportunities',
    description: 'Opportunities linked to the company.',
    icon: 'IconTargetArrow',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  opportunities: Relation<OpportunityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favorites',
    description: 'Favorites linked to the company',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Attachments',
    description: 'Attachments linked to the company',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Timeline Activities',
    description: 'Timeline Activities linked to the company',
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.address_deprecated,
    type: FieldMetadataType.TEXT,
    label: 'Address (deprecated) ',
    description:
      'Address of the company - deprecated in favor of new address field',
    icon: 'IconMap',
  })
  @WorkspaceIsDeprecated()
  @WorkspaceIsNullable()
  addressOld: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_COMPANY,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  [SEARCH_VECTOR_FIELD.name]: any;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoUUID,
    type: FieldMetadataType.UUID,
    label: 'Demo UUID',
    description: 'Demo UUID',
    icon: 'IconIdBadge2',
  })
  @WorkspaceIsNullable()
  demoUUID: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoRichText,
    type: FieldMetadataType.RICH_TEXT,
    label: 'Demo Rich Text',
    description: 'Demo Rich Text',
    icon: 'IconTextCaption',
  })
  @WorkspaceIsNullable()
  demoRichText: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoArray,
    type: FieldMetadataType.ARRAY,
    label: 'Demo Array',
    description: 'Demo Array',
    icon: 'IconBrackets',
  })
  @WorkspaceIsNullable()
  demoArray: string[] | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoRating,
    type: FieldMetadataType.RATING,
    label: 'Demo Rating',
    description: 'Demo Rating',
    icon: 'IconStars',
    options: [
      {
        label: '1',
        value: 'RATING_1',
        position: 0,
      },
      {
        label: '2',
        value: 'RATING_2',
        position: 1,
      },
      {
        label: '3',
        value: 'RATING_3',
        position: 2,
      },
      {
        label: '4',
        value: 'RATING_4',
        position: 3,
      },
      {
        label: '5',
        value: 'RATING_5',
        position: 4,
      },
    ],
  })
  @WorkspaceIsNullable()
  demoRating: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoSelect,
    type: FieldMetadataType.SELECT,
    label: 'Demo Select',
    description: 'Demo Select',
    icon: 'IconTag',
    options: [
      {
        value: CompanyDemoSelect.OPTION_SINGLE_1,
        label: 'Option 1',
        position: 0,
        color: 'gray',
      },
      {
        value: CompanyDemoSelect.OPTION_SINGLE_2,
        label: 'Option 2',
        position: 1,
        color: 'yellow',
      },
      {
        value: CompanyDemoSelect.OPTION_SINGLE_3,
        label: 'Option 3',
        position: 2,
        color: 'green',
      },
      {
        value: CompanyDemoSelect.OPTION_SINGLE_4,
        label: 'Option 4',
        position: 3,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsNullable()
  demoSelect: CompanyDemoSelect;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoMultiSelect,
    type: FieldMetadataType.MULTI_SELECT,
    label: 'Demo Multi Select',
    description: 'Demo Multi Select',
    icon: 'IconTags',
    options: [
      {
        value: CompanyDemoMultiSelect.OPTION_MULTI_1,
        label: 'Option multi 1',
        position: 0,
        color: 'gray',
      },
      {
        value: CompanyDemoMultiSelect.OPTION_MULTI_2,
        label: 'Option multi 2',
        position: 1,
        color: 'yellow',
      },
      {
        value: CompanyDemoMultiSelect.OPTION_MULTI_3,
        label: 'Option multi 3',
        position: 2,
        color: 'green',
      },
      {
        value: CompanyDemoMultiSelect.OPTION_MULTI_4,
        label: 'Option multi 4',
        position: 3,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsNullable()
  demoMultiSelect: CompanyDemoMultiSelect;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoRawJSON,
    type: FieldMetadataType.RAW_JSON,
    label: 'Demo Raw JSON',
    description: 'Demo Raw JSON',
    icon: 'IconJson',
  })
  @WorkspaceIsNullable()
  demoRawJSON: JSON | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoEmails,
    type: FieldMetadataType.EMAILS,
    label: 'Demo Emails',
    description: 'Demo Emails',
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  demoEmails: EmailsMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoPhones,
    type: FieldMetadataType.PHONES,
    label: 'Demo Phones',
    description: 'Demo Phones',
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  demoPhones: PhonesMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.demoFullName,
    type: FieldMetadataType.FULL_NAME,
    label: 'Demo Full Name',
    description: 'Demo Full Name',
    icon: 'IconSignature',
  })
  @WorkspaceIsNullable()
  demoFullName: FullNameMetadata | null;
}
