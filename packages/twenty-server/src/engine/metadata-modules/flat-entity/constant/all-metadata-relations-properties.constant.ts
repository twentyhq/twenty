import { type AllMetadataName } from 'twenty-shared/metadata';

import { ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';
import { Relation } from 'typeorm';

export const ALL_METADATA_RELATION_PROPERTIES = {
  agent: {
    manyToOne: {
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  skill: {
    workspace: true,
    application: true,
  },
  fieldMetadata: {
    manyToOne: {
      object: { metadataName: 'objectMetadata' },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
      relationTargetFieldMetadata: { metadataName: 'fieldMetadata' },
      relationTargetObjectMetadata: { metadataName: 'objectMetadata' },
    },
    oneToMany: {
      fieldPermissions: { metadataName: undefined },
      indexFieldMetadatas: { metadataName: undefined },
      viewFields: { metadataName: 'viewField' },
      viewFilters: { metadataName: 'viewFilter' },
      kanbanAggregateOperationViews: { metadataName: 'view' },
      calendarViews: { metadataName: 'view' },
      mainGroupByFieldMetadataViews: { metadataName: 'view' },
    },
  },
  objectMetadata: {
    manyToOne: {
      dataSource: { metadataName: undefined },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {
      fields: { metadataName: 'fieldMetadata' },
      indexMetadatas: { metadataName: 'index' },
      targetRelationFields: { metadataName: 'fieldMetadata' },
      objectPermissions: { metadataName: undefined },
      fieldPermissions: { metadataName: undefined },
      views: { metadataName: 'view' },
    },
  },
  view: {
    manyToOne: {
      objectMetadata: { metadataName: 'objectMetadata' },
      workspace: { metadataName: undefined },
      createdBy: { metadataName: undefined },
      application: { metadataName: undefined },
      calendarFieldMetadata: { metadataName: 'fieldMetadata' },
      kanbanAggregateOperationFieldMetadata: { metadataName: 'fieldMetadata' },
      mainGroupByFieldMetadata: { metadataName: 'fieldMetadata' },
    },
    oneToMany: {
      viewFields: { metadataName: 'viewField' },
      viewFilters: { metadataName: 'viewFilter' },
      viewFilterGroups: { metadataName: undefined },
      viewGroups: { metadataName: 'viewGroup' },
      viewSorts: { metadataName: undefined },
    },
  },
  viewField: {
    manyToOne: {
      fieldMetadata: { metadataName: 'fieldMetadata' },
      view: { metadataName: 'view' },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  viewFilter: {
    manyToOne: {
      fieldMetadata: { metadataName: 'fieldMetadata' },
      view: { metadataName: 'view' },
      // @ts-expect-error TODO migrate viewFilterGroup to v2
      viewFilterGroup: { metadataName: undefined },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  viewGroup: {
    manyToOne: {
      view: { metadataName: 'view' },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  index: {
    manyToOne: {
      objectMetadata: { metadataName: 'objectMetadata' },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {
      indexFieldMetadatas: { metadataName: undefined },
    },
  },
  serverlessFunction: {
    manyToOne: {
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
      serverlessFunctionLayer: { metadataName: undefined },
    },
    oneToMany: {
      cronTriggers: { metadataName: 'cronTrigger' },
      databaseEventTriggers: { metadataName: 'databaseEventTrigger' },
      routeTriggers: { metadataName: 'routeTrigger' },
    },
  },
  cronTrigger: {
    manyToOne: {
      serverlessFunction: { metadataName: 'serverlessFunction' },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  databaseEventTrigger: {
    manyToOne: {
      serverlessFunction: { metadataName: 'serverlessFunction' },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  routeTrigger: {
    manyToOne: {
      serverlessFunction: { metadataName: 'serverlessFunction' },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  role: {
    manyToOne: {
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {
      roleTargets: { metadataName: 'roleTarget' },
      objectPermissions: { metadataName: undefined },
      permissionFlags: { metadataName: undefined },
      fieldPermissions: { metadataName: undefined },
    },
  },
  roleTarget: {
    manyToOne: {
      role: { metadataName: 'role' },
      apiKey: { metadataName: undefined },
      workspace: { metadataName: undefined },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  pageLayout: {
    manyToOne: {
      workspace: { metadataName: undefined },
      objectMetadata: { metadataName: 'objectMetadata' },
      application: { metadataName: undefined },
    },
    oneToMany: {
      tabs: { metadataName: 'pageLayoutTab' },
    },
  },
  pageLayoutTab: {
    manyToOne: {
      workspace: { metadataName: undefined },
      pageLayout: { metadataName: 'pageLayout' },
      application: { metadataName: undefined },
    },
    oneToMany: {
      widgets: { metadataName: 'pageLayoutWidget' },
    },
  },
  pageLayoutWidget: {
    manyToOne: {
      workspace: { metadataName: undefined },
      pageLayoutTab: { metadataName: 'pageLayoutTab' },
      objectMetadata: { metadataName: 'objectMetadata' },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicate: {
    manyToOne: {
      workspace: { metadataName: undefined },
      role: { metadataName: 'role' },
      fieldMetadata: { metadataName: 'fieldMetadata' },
      workspaceMemberFieldMetadata: { metadataName: 'fieldMetadata' },
      objectMetadata: { metadataName: 'objectMetadata' },
      rowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
      },
      application: { metadataName: undefined },
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicateGroup: {
    manyToOne: {
      workspace: { metadataName: undefined },
      role: { metadataName: 'role' },
      parentRowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
      },
      application: { metadataName: undefined },
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
    view: true,
    viewFilters: true,
    parentViewFilterGroup: true,
    childViewFilterGroups: true,
    workspace: true,
    application: true,
  },
} as const satisfies {
  [TName in AllMetadataName]: {
    manyToOne: {
      [P in ExtractEntityManyToOneEntityRelationProperties<
        MetadataEntity<TName>
      >]: {
        metadataName: NonNullable<
          MetadataEntity<TName>[P]
        > extends SyncableEntity
          ? FromMetadataEntityToMetadataName<
              NonNullable<MetadataEntity<TName>[P]>
            >
          : undefined;
      };
    };
    oneToMany: {
      [P in ExtractEntityOneToManyEntityRelationProperties<
        MetadataEntity<TName>
      >]: {
        metadataName: MetadataEntity<TName>[P] extends Relation<
          SyncableEntity[]
        >
          ? FromMetadataEntityToMetadataName<MetadataEntity<TName>[P]>
          : undefined;
      };
    };
  };
};
