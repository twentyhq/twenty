import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';
import { type RemoveSuffix } from 'twenty-shared/types';

import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

type OneToManyRelationValue<
  TSourceMetadataName extends AllMetadataName,
  TRelationProperty extends ExtractEntityOneToManyEntityRelationProperties<
    MetadataEntity<TSourceMetadataName>
  >,
> = MetadataEntity<TSourceMetadataName>[TRelationProperty] extends (infer TTargetEntity extends
  SyncableEntity)[]
  ? TRelationProperty extends string
    ? {
        metadataName: FromMetadataEntityToMetadataName<TTargetEntity>;
        flatEntityForeignKeyAggregator: `${RemoveSuffix<TRelationProperty, 's'>}Ids`;
        universalFlatEntityForeignKeyAggregator: `${RemoveSuffix<TRelationProperty, 's'>}UniversalIdentifiers`;
      }
    : never
  : null;

type OneToManyMetadataRelationsProperties = {
  [TSourceMetadataName in AllMetadataName]: {
    [TRelationProperty in ExtractEntityOneToManyEntityRelationProperties<
      MetadataEntity<TSourceMetadataName>
    >]: OneToManyRelationValue<TSourceMetadataName, TRelationProperty>;
  };
};

export const ALL_ONE_TO_MANY_METADATA_RELATIONS = {
  agent: {},
  skill: {},
  commandMenuItem: {},
  navigationMenuItem: {},
  fieldMetadata: {
    fieldPermissions: null,
    indexFieldMetadatas: null,
    viewFields: {
      metadataName: 'viewField',
      flatEntityForeignKeyAggregator: 'viewFieldIds',
      universalFlatEntityForeignKeyAggregator: 'viewFieldUniversalIdentifiers',
    },
    viewFilters: {
      metadataName: 'viewFilter',
      flatEntityForeignKeyAggregator: 'viewFilterIds',
      universalFlatEntityForeignKeyAggregator: 'viewFilterUniversalIdentifiers',
    },
    kanbanAggregateOperationViews: {
      metadataName: 'view',
      flatEntityForeignKeyAggregator: 'kanbanAggregateOperationViewIds',
      universalFlatEntityForeignKeyAggregator:
        'kanbanAggregateOperationViewUniversalIdentifiers',
    },
    calendarViews: {
      metadataName: 'view',
      flatEntityForeignKeyAggregator: 'calendarViewIds',
      universalFlatEntityForeignKeyAggregator:
        'calendarViewUniversalIdentifiers',
    },
    mainGroupByFieldMetadataViews: {
      metadataName: 'view',
      flatEntityForeignKeyAggregator: 'mainGroupByFieldMetadataViewIds',
      universalFlatEntityForeignKeyAggregator:
        'mainGroupByFieldMetadataViewUniversalIdentifiers',
    },
  },
  objectMetadata: {
    fields: {
      metadataName: 'fieldMetadata',
      flatEntityForeignKeyAggregator: 'fieldIds',
      universalFlatEntityForeignKeyAggregator: 'fieldUniversalIdentifiers',
    },
    indexMetadatas: {
      metadataName: 'index',
      flatEntityForeignKeyAggregator: 'indexMetadataIds',
      universalFlatEntityForeignKeyAggregator:
        'indexMetadataUniversalIdentifiers',
    },
    objectPermissions: null,
    fieldPermissions: null,
    views: {
      metadataName: 'view',
      flatEntityForeignKeyAggregator: 'viewIds',
      universalFlatEntityForeignKeyAggregator: 'viewUniversalIdentifiers',
    },
  },
  view: {
    viewFields: {
      metadataName: 'viewField',
      flatEntityForeignKeyAggregator: 'viewFieldIds',
      universalFlatEntityForeignKeyAggregator: 'viewFieldUniversalIdentifiers',
    },
    viewFilters: {
      metadataName: 'viewFilter',
      flatEntityForeignKeyAggregator: 'viewFilterIds',
      universalFlatEntityForeignKeyAggregator: 'viewFilterUniversalIdentifiers',
    },
    viewFilterGroups: {
      metadataName: 'viewFilterGroup',
      flatEntityForeignKeyAggregator: 'viewFilterGroupIds',
      universalFlatEntityForeignKeyAggregator:
        'viewFilterGroupUniversalIdentifiers',
    },
    viewGroups: {
      metadataName: 'viewGroup',
      flatEntityForeignKeyAggregator: 'viewGroupIds',
      universalFlatEntityForeignKeyAggregator: 'viewGroupUniversalIdentifiers',
    },
    viewFieldGroups: {
      metadataName: 'viewFieldGroup',
      flatEntityForeignKeyAggregator: 'viewFieldGroupIds',
      universalFlatEntityForeignKeyAggregator:
        'viewFieldGroupUniversalIdentifiers',
    },
    // @ts-expect-error TODO migrate viewSort to v2
    viewSorts: null,
  },
  viewField: {},
  viewFieldGroup: {
    viewFields: {
      metadataName: 'viewField',
      flatEntityForeignKeyAggregator: 'viewFieldIds',
      universalFlatEntityForeignKeyAggregator: 'viewFieldUniversalIdentifiers',
    },
  },
  viewFilter: {},
  viewGroup: {},
  index: {
    indexFieldMetadatas: null,
  },
  logicFunction: {},
  role: {
    roleTargets: {
      metadataName: 'roleTarget',
      flatEntityForeignKeyAggregator: 'roleTargetIds',
      universalFlatEntityForeignKeyAggregator: 'roleTargetUniversalIdentifiers',
    },
    objectPermissions: null,
    permissionFlags: null,
    fieldPermissions: null,
    rowLevelPermissionPredicates: {
      metadataName: 'rowLevelPermissionPredicate',
      flatEntityForeignKeyAggregator: 'rowLevelPermissionPredicateIds',
      universalFlatEntityForeignKeyAggregator:
        'rowLevelPermissionPredicateUniversalIdentifiers',
    },
    rowLevelPermissionPredicateGroups: {
      metadataName: 'rowLevelPermissionPredicateGroup',
      flatEntityForeignKeyAggregator: 'rowLevelPermissionPredicateGroupIds',
      universalFlatEntityForeignKeyAggregator:
        'rowLevelPermissionPredicateGroupUniversalIdentifiers',
    },
  },
  roleTarget: {},
  pageLayout: {
    tabs: {
      metadataName: 'pageLayoutTab',
      flatEntityForeignKeyAggregator: 'tabIds',
      universalFlatEntityForeignKeyAggregator: 'tabUniversalIdentifiers',
    },
  },
  pageLayoutTab: {
    widgets: {
      metadataName: 'pageLayoutWidget',
      flatEntityForeignKeyAggregator: 'widgetIds',
      universalFlatEntityForeignKeyAggregator: 'widgetUniversalIdentifiers',
    },
  },
  pageLayoutWidget: {},
  rowLevelPermissionPredicate: {},
  rowLevelPermissionPredicateGroup: {
    childRowLevelPermissionPredicateGroups: {
      metadataName: 'rowLevelPermissionPredicateGroup',
      flatEntityForeignKeyAggregator:
        'childRowLevelPermissionPredicateGroupIds',
      universalFlatEntityForeignKeyAggregator:
        'childRowLevelPermissionPredicateGroupUniversalIdentifiers',
    },
    rowLevelPermissionPredicates: {
      metadataName: 'rowLevelPermissionPredicate',
      flatEntityForeignKeyAggregator: 'rowLevelPermissionPredicateIds',
      universalFlatEntityForeignKeyAggregator:
        'rowLevelPermissionPredicateUniversalIdentifiers',
    },
  },
  viewFilterGroup: {
    childViewFilterGroups: {
      metadataName: 'viewFilterGroup',
      flatEntityForeignKeyAggregator: 'childViewFilterGroupIds',
      universalFlatEntityForeignKeyAggregator:
        'childViewFilterGroupUniversalIdentifiers',
    },
    viewFilters: {
      metadataName: 'viewFilter',
      flatEntityForeignKeyAggregator: 'viewFilterIds',
      universalFlatEntityForeignKeyAggregator: 'viewFilterUniversalIdentifiers',
    },
  },
  frontComponent: {},
  webhook: {},
} as const satisfies OneToManyMetadataRelationsProperties;

// satisfies with complex mapped types involving nested generics doesn't always catch missing required keys
// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    AllMetadataName extends keyof typeof ALL_ONE_TO_MANY_METADATA_RELATIONS
      ? true
      : false
  >,
];
