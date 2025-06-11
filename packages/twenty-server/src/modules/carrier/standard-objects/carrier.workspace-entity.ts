import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CARRIER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
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
const DOMAIN_NAME_FIELD_NAME = 'domainName';

export const SEARCH_FIELDS_FOR_CARRIER: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: DOMAIN_NAME_FIELD_NAME, type: FieldMetadataType.LINKS },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.carrier,
  namePlural: 'carriers',
  labelSingular: msg`Carrier`,
  labelPlural: msg`Carriers`,
  description: msg`A carrier`,
  icon: STANDARD_OBJECT_ICONS.carrier,
  shortcut: 'I',
  labelIdentifierStandardId: CARRIER_STANDARD_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['domainNamePrimaryLinkUrl']])
@WorkspaceIsSearchable()
export class CarrierWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CARRIER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The carrier name`,
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @WorkspaceField({
    standardId: CARRIER_STANDARD_FIELD_IDS.domainName,
    type: FieldMetadataType.LINKS,
    label: msg`Domain Name`,
    description: msg`The carrier website URL. We use this url to fetch the carrier icon`,
    icon: 'IconLink',
  })
  @WorkspaceIsUnique()
  domainName: LinksMetadata;

  @WorkspaceField({
    standardId: CARRIER_STANDARD_FIELD_IDS.location,
    type: FieldMetadataType.TEXT,
    label: msg`Location`,
    description: msg`The carrier's location`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  location: string;

  @WorkspaceField({
    standardId: CARRIER_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Carrier record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;


  // Relations
  @WorkspaceRelation({
    standardId: CARRIER_STANDARD_FIELD_IDS.policies,
    type: RelationType.ONE_TO_MANY,
    label: msg`Policies`,
    description: msg`Policies linked to the carrier`,
    icon: 'IconFileText',
    inverseSideTarget: () => PolicyWorkspaceEntity,
    inverseSideFieldKey: 'carrier',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  policies: Relation<PolicyWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: CARRIER_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the carrier`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: CARRIER_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the carrier`,
    icon: 'IconTimeline',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: CARRIER_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_CARRIER,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
