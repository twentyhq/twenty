import { type AllMetadataName } from 'twenty-shared/metadata';

import { ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

export const ALL_METADATA_RELATION_PROPERTIES = {
  agent: {
    manyToOne: {
      workspace: true,
      application: true,
    },
    oneToMany: {},
  },
  skill: {
    workspace: true,
    application: true,
  },
  fieldMetadata: {
    manyToOne: {
      object: {
        metadataName: 'objectMetadata',
      },
      workspace: {},
      application: true,
      relationTargetFieldMetadata: true,
      relationTargetObjectMetadata: true,
    },
    oneToMany: {
      fieldPermissions: true,
      indexFieldMetadatas: true,
      viewFields: true,
      viewFilters: true,
      kanbanAggregateOperationViews: true,
      calendarViews: true,
      mainGroupByFieldMetadataViews: true,
    },
  },
  objectMetadata: {
    manyToOne: {
      dataSource: true,
      workspace: true,
      application: true,
    },
    oneToMany: {
      fields: true,
      indexMetadatas: true,
      targetRelationFields: true,
      objectPermissions: true,
      fieldPermissions: true,
      views: true,
    },
  },
  view: {
    manyToOne: {
      objectMetadata: true,
      workspace: true,
      createdBy: true,
      application: true,
      calendarFieldMetadata: true,
      kanbanAggregateOperationFieldMetadata: true,
      mainGroupByFieldMetadata: true,
    },
    oneToMany: {
      viewFields: true,
      viewFilters: true,
      viewFilterGroups: true,
      viewGroups: true,
      viewSorts: true,
    },
  },
  viewField: {
    manyToOne: {
      fieldMetadata: true,
      view: true,
      workspace: true,
      application: true,
    },
    oneToMany: {},
  },
  viewFilter: {
    manyToOne: {
      fieldMetadata: true,
      view: true,
      viewFilterGroup: true,
      workspace: true,
      application: true,
    },
    oneToMany: {},
  },
  viewGroup: {
    manyToOne: {
      view: true,
      workspace: true,
      application: true,
    },
    oneToMany: {},
  },
  index: {
    manyToOne: {
      objectMetadata: true,
      workspace: true,
      application: true,
    },
    oneToMany: {
      indexFieldMetadatas: true,
    },
  },
  serverlessFunction: {
    manyToOne: {
      workspace: true,
      application: true,
      serverlessFunctionLayer: true,
    },
    oneToMany: {
      cronTriggers: true,
      databaseEventTriggers: true,
      routeTriggers: true,
    },
  },
  cronTrigger: {
    manyToOne: {
      serverlessFunction: true,
      workspace: true,
      application: true,
    },
    oneToMany: {},
  },
  databaseEventTrigger: {
    manyToOne: {
      serverlessFunction: true,
      workspace: true,
      application: true,
    },
    oneToMany: {},
  },
  routeTrigger: {
    manyToOne: {
      serverlessFunction: true,
      workspace: true,
      application: true,
    },
    oneToMany: {},
  },
  role: {
    manyToOne: {
      workspace: true,
      application: true,
    },
    oneToMany: {
      roleTargets: true,
      objectPermissions: true,
      permissionFlags: true,
      fieldPermissions: true,
    },
  },
  roleTarget: {
    manyToOne: {
      role: true,
      apiKey: true,
      workspace: true,
      application: true,
    },
    oneToMany: {},
  },
  pageLayout: {
    manyToOne: {
      workspace: true,
      objectMetadata: true,
      application: true,
    },
    oneToMany: {
      tabs: true,
    },
  },
  pageLayoutTab: {
    manyToOne: {
      workspace: true,
      pageLayout: true,
      application: true,
    },
    oneToMany: {
      widgets: true,
    },
  },
  pageLayoutWidget: {
    manyToOne: {
      workspace: true,
      pageLayoutTab: true,
      objectMetadata: true,
      application: true,
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicate: {
    manyToOne: {
      workspace: true,
      role: true,
      fieldMetadata: true,
      workspaceMemberFieldMetadata: true,
      objectMetadata: true,
      rowLevelPermissionPredicateGroup: true,
      application: true,
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicateGroup: {
    manyToOne: {
      workspace: true,
      role: true,
      parentRowLevelPermissionPredicateGroup: true,
      application: true,
    },
    oneToMany: {
      childRowLevelPermissionPredicateGroups: true,
      rowLevelPermissionPredicates: true,
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
        metadataName: MetadataEntity<TName>[P] extends SyncableEntity
          ? FromMetadataEntityToMetadataName<MetadataEntity<TName>[P]>
          : undefined;
      };
    };
    oneToMany: {
      [P in ExtractEntityOneToManyEntityRelationProperties<
        MetadataEntity<TName>
      >]: {
        metadataName: MetadataEntity<TName>[P] extends SyncableEntity
          ? FromMetadataEntityToMetadataName<MetadataEntity<TName>[P]>
          : undefined;
      };
    };
  };
};
