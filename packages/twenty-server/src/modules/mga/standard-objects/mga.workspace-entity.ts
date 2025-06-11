import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
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
import { MGA_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { PolicyWorkspaceEntity } from 'src/modules/policy/standard-objects/policy.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'name';
const NAIC_FIELD_NAME = 'naic';

export const SEARCH_FIELDS_FOR_MGA: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: NAIC_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.mga,
  namePlural: 'mgas',
  labelSingular: msg`MGA`,
  labelPlural: msg`MGAs`,
  description: msg`A Managing General Agent`,
  icon: STANDARD_OBJECT_ICONS.mga,
  shortcut: 'M',
  labelIdentifierStandardId: MGA_STANDARD_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['naic']])
@WorkspaceIsSearchable()
export class MGAWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The MGA name`,
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.naic,
    type: FieldMetadataType.TEXT,
    label: msg`NAIC`,
    description: msg`The MGA's NAIC number`,
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  naic: string;

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.phone,
    type: FieldMetadataType.TEXT,
    label: msg`Phone`,
    description: msg`The MGA's phone number`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  phone: string;

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.email,
    type: FieldMetadataType.TEXT,
    label: msg`Email`,
    description: msg`The MGA's email address`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  email: string;

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.fullAddress,
    type: FieldMetadataType.TEXT,
    label: msg`Full Address`,
    description: msg`The MGA's complete address`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  fullAddress: string;

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Active`,
    description: msg`Whether the MGA is active`,
    icon: 'IconCheck',
    defaultValue: true,
  })
  isActive: boolean;

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.lineOfBusiness,
    type: FieldMetadataType.ARRAY,
    label: msg`Lines of Business`,
    description: msg`The MGA's lines of business`,
    icon: 'IconList',
  })
  @WorkspaceIsNullable()
  lineOfBusiness: string[];

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.commissionStructure,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Commission Structure`,
    description: msg`The MGA's commission structure`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  commissionStructure: {
    newBusiness: number;
    renewal: number;
  };

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`MGA record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  // Relations
  @WorkspaceRelation({
    standardId: MGA_STANDARD_FIELD_IDS.policies,
    type: RelationType.ONE_TO_MANY,
    label: msg`Policies`,
    description: msg`Policies linked to the MGA`,
    icon: 'IconFileText',
    inverseSideTarget: () => PolicyWorkspaceEntity,
    inverseSideFieldKey: 'mga',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  policies: Relation<PolicyWorkspaceEntity[]>;

  @WorkspaceJoinColumn('policies')
  policiesId: string;

  @WorkspaceRelation({
    standardId: MGA_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the MGA`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MGA_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the MGA`,
    icon: 'IconTimeline',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MGA_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MGA,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
} 