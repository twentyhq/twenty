import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';
import {
  type ExtractPropertiesThatEndsWithId,
  type ExtractPropertiesThatEndsWithIds,
} from 'twenty-shared/types';
import { type Relation } from 'typeorm';

import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

type ManyToOneRelationValue<
  TSourceMetadataName extends AllMetadataName,
  TRelationProperty extends ExtractEntityManyToOneEntityRelationProperties<
    MetadataEntity<TSourceMetadataName>
  >,
> =
  NonNullable<
    MetadataEntity<TSourceMetadataName>[TRelationProperty]
  > extends Relation<infer TTargetEntity extends SyncableEntity>
    ? {
        metadataName: FromMetadataEntityToMetadataName<TTargetEntity>;
        flatEntityForeignKeyAggregator: ExtractPropertiesThatEndsWithIds<
          MetadataFlatEntity<FromMetadataEntityToMetadataName<TTargetEntity>>
          // Note: In the best of the world should not be nullable, entities should always declare inverside keys
        > | null;
        foreignKey: ExtractPropertiesThatEndsWithId<
          MetadataFlatEntity<TSourceMetadataName>,
          'id' | 'workspaceId'
        >;
      }
    : null;

type OneToManyRelationValue<
  TSourceMetadataName extends AllMetadataName,
  TRelationProperty extends ExtractEntityOneToManyEntityRelationProperties<
    MetadataEntity<TSourceMetadataName>
  >,
> =
  MetadataEntity<TSourceMetadataName>[TRelationProperty] extends Relation<
    (infer TTargetEntity extends SyncableEntity)[]
  >
    ? {
        metadataName: FromMetadataEntityToMetadataName<TTargetEntity>;
      }
    : null;

type MetadataRelationsProperties = {
  [TSourceMetadataName in AllMetadataName]: {
    manyToOne: {
      [TRelationProperty in ExtractEntityManyToOneEntityRelationProperties<
        MetadataEntity<TSourceMetadataName>
      >]: ManyToOneRelationValue<TSourceMetadataName, TRelationProperty>;
    };
    oneToMany: {
      [TRelationProperty in ExtractEntityOneToManyEntityRelationProperties<
        MetadataEntity<TSourceMetadataName>
      >]: OneToManyRelationValue<TSourceMetadataName, TRelationProperty>;
    };
  };
};

export const ALL_METADATA_RELATIONS = {
  agent: {
    manyToOne: {
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  skill: {
    manyToOne: {
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  fieldMetadata: {
    manyToOne: {
      object: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: 'fieldMetadataIds',
        foreignKey: 'objectMetadataId',
      },
      workspace: null,
      application: null,
      relationTargetFieldMetadata: {
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'relationTargetFieldMetadataId',
      },
      relationTargetObjectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'relationTargetObjectMetadataId',
      },
    },
    oneToMany: {
      fieldPermissions: null,
      indexFieldMetadatas: null,
      viewFields: { metadataName: 'viewField' },
      viewFilters: { metadataName: 'viewFilter' },
      kanbanAggregateOperationViews: { metadataName: 'view' },
      calendarViews: { metadataName: 'view' },
      mainGroupByFieldMetadataViews: { metadataName: 'view' },
    },
  },
  objectMetadata: {
    manyToOne: {
      dataSource: null,
      workspace: null,
      application: null,
    },
    oneToMany: {
      fields: { metadataName: 'fieldMetadata' },
      indexMetadatas: { metadataName: 'index' },
      targetRelationFields: { metadataName: 'fieldMetadata' },
      objectPermissions: null,
      fieldPermissions: null,
      views: { metadataName: 'view' },
    },
  },
  view: {
    manyToOne: {
      objectMetadata: {
        foreignKey: 'objectMetadataId',
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: 'viewIds',
      },
      workspace: null,
      createdBy: null,
      application: null,
      calendarFieldMetadata: {
        foreignKey: 'calendarFieldMetadataId',
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: 'calendarViewIds',
      },
      kanbanAggregateOperationFieldMetadata: {
        foreignKey: 'kanbanAggregateOperationFieldMetadataId',
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: 'kanbanAggregateOperationViewIds',
      },
      mainGroupByFieldMetadata: {
        foreignKey: 'mainGroupByFieldMetadataId',
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: 'mainGroupByFieldMetadataViewIds',
      },
    },
    oneToMany: {
      viewFields: { metadataName: 'viewField' },
      viewFilters: { metadataName: 'viewFilter' },
      viewFilterGroups: {
        metadataName: 'viewFilterGroup',
      },
      viewGroups: { metadataName: 'viewGroup' },
      // @ts-expect-error TODO migrate viewSort to v2
      viewSorts: null,
    },
  },
  viewField: {
    manyToOne: {
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: 'viewFieldIds',
        foreignKey: 'fieldMetadataId',
      },
      view: {
        metadataName: 'view',
        flatEntityForeignKeyAggregator: 'viewFieldIds',
        foreignKey: 'viewId',
      },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  viewFilter: {
    manyToOne: {
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: 'viewFilterIds',
        foreignKey: 'fieldMetadataId',
      },
      view: {
        metadataName: 'view',
        flatEntityForeignKeyAggregator: 'viewFilterIds',
        foreignKey: 'viewId',
      },
      viewFilterGroup: {
        flatEntityForeignKeyAggregator: 'viewFilterIds',
        foreignKey: 'viewFilterGroupId',
        metadataName: 'viewFilterGroup',
      },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  viewGroup: {
    manyToOne: {
      view: {
        metadataName: 'view',
        flatEntityForeignKeyAggregator: 'viewGroupIds',
        foreignKey: 'viewId',
      },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  index: {
    manyToOne: {
      objectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: 'indexMetadataIds',
        foreignKey: 'objectMetadataId',
      },
      workspace: null,
      application: null,
    },
    oneToMany: {
      indexFieldMetadatas: null,
    },
  },
  serverlessFunction: {
    manyToOne: {
      workspace: null,
      application: null,
      serverlessFunctionLayer: null,
    },
    oneToMany: {
      cronTriggers: { metadataName: 'cronTrigger' },
      databaseEventTriggers: { metadataName: 'databaseEventTrigger' },
      routeTriggers: { metadataName: 'routeTrigger' },
    },
  },
  cronTrigger: {
    manyToOne: {
      serverlessFunction: {
        metadataName: 'serverlessFunction',
        flatEntityForeignKeyAggregator: 'cronTriggerIds',
        foreignKey: 'serverlessFunctionId',
      },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  databaseEventTrigger: {
    manyToOne: {
      serverlessFunction: {
        metadataName: 'serverlessFunction',
        flatEntityForeignKeyAggregator: 'databaseEventTriggerIds',
        foreignKey: 'serverlessFunctionId',
      },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  routeTrigger: {
    manyToOne: {
      serverlessFunction: {
        metadataName: 'serverlessFunction',
        flatEntityForeignKeyAggregator: 'routeTriggerIds',
        foreignKey: 'serverlessFunctionId',
      },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  role: {
    manyToOne: {
      workspace: null,
      application: null,
    },
    oneToMany: {
      roleTargets: { metadataName: 'roleTarget' },
      objectPermissions: null,
      permissionFlags: null,
      fieldPermissions: null,
    },
  },
  roleTarget: {
    manyToOne: {
      role: {
        metadataName: 'role',
        flatEntityForeignKeyAggregator: 'roleTargetIds',
        foreignKey: 'roleId',
      },
      apiKey: null,
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  pageLayout: {
    manyToOne: {
      workspace: null,
      objectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'objectMetadataId',
      },
      application: null,
    },
    oneToMany: {
      tabs: { metadataName: 'pageLayoutTab' },
    },
  },
  pageLayoutTab: {
    manyToOne: {
      workspace: null,
      pageLayout: {
        metadataName: 'pageLayout',
        flatEntityForeignKeyAggregator: 'tabIds',
        foreignKey: 'pageLayoutId',
      },
      application: null,
    },
    oneToMany: {
      widgets: { metadataName: 'pageLayoutWidget' },
    },
  },
  pageLayoutWidget: {
    manyToOne: {
      workspace: null,
      pageLayoutTab: {
        metadataName: 'pageLayoutTab',
        flatEntityForeignKeyAggregator: 'widgetIds',
        foreignKey: 'pageLayoutTabId',
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'objectMetadataId',
      },
      application: null,
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicate: {
    manyToOne: {
      workspace: null,
      role: {
        metadataName: 'role',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'roleId',
      },
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'fieldMetadataId',
      },
      workspaceMemberFieldMetadata: {
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'workspaceMemberFieldMetadataId',
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'objectMetadataId',
      },
      rowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'rowLevelPermissionPredicateGroupId',
      },
      application: null,
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicateGroup: {
    manyToOne: {
      workspace: null,
      role: {
        metadataName: 'role',
        foreignKey: 'roleId',
        flatEntityForeignKeyAggregator: null,
      },
      parentRowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKey: 'parentRowLevelPermissionPredicateGroupId',
        flatEntityForeignKeyAggregator:
          'childRowLevelPermissionPredicateGroupIds',
      },
      application: null,
    },
    oneToMany: {
      childRowLevelPermissionPredicateGroups: {
        metadataName: 'rowLevelPermissionPredicateGroup',
      },
      rowLevelPermissionPredicates: {
        metadataName: 'rowLevelPermissionPredicate',
      },
    },
  },
  viewFilterGroup: {
    manyToOne: {
      application: null,
      parentViewFilterGroup: {
        flatEntityForeignKeyAggregator: 'childViewFilterGroupIds',
        foreignKey: 'parentViewFilterGroupId',
        metadataName: 'viewFilterGroup',
      },
      view: {
        metadataName: 'view',
        flatEntityForeignKeyAggregator: 'viewFilterGroupIds',
        foreignKey: 'viewId',
      },
      workspace: null,
    },
    oneToMany: {
      childViewFilterGroups: {
        metadataName: 'viewFilterGroup',
      },
      viewFilters: {
        metadataName: 'viewFilter',
      },
    },
  },
} as const satisfies MetadataRelationsProperties;

// Note: satisfies with complex mapped types involving nested generics doesn't always catch missing required keys
// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    AllMetadataName extends keyof typeof ALL_METADATA_RELATIONS ? true : false
  >,
];
