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
      workspace: null,
      application: null,
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
      workspace: null,
      application: null,
      relationTargetFieldMetadata: { metadataName: 'fieldMetadata' },
      relationTargetObjectMetadata: { metadataName: 'objectMetadata' },
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
      objectMetadata: { metadataName: 'objectMetadata' },
      workspace: null,
      createdBy: null,
      application: null,
      calendarFieldMetadata: { metadataName: 'fieldMetadata' },
      kanbanAggregateOperationFieldMetadata: { metadataName: 'fieldMetadata' },
      mainGroupByFieldMetadata: { metadataName: 'fieldMetadata' },
    },
    oneToMany: {
      viewFields: { metadataName: 'viewField' },
      viewFilters: { metadataName: 'viewFilter' },
      // @ts-expect-error TODO migrate viewFilterGroup to v2
      viewFilterGroups: null,
      viewGroups: { metadataName: 'viewGroup' },
      // @ts-expect-error TODO migrate viewSort to v2
      viewSorts: null,
    },
  },
  viewField: {
    manyToOne: {
      fieldMetadata: { metadataName: 'fieldMetadata' },
      view: { metadataName: 'view' },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  viewFilter: {
    manyToOne: {
      fieldMetadata: { metadataName: 'fieldMetadata' },
      view: { metadataName: 'view' },
      // @ts-expect-error TODO migrate viewFilterGroup to v2
      viewFilterGroup: null,
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  viewGroup: {
    manyToOne: {
      view: { metadataName: 'view' },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  index: {
    manyToOne: {
      objectMetadata: { metadataName: 'objectMetadata' },
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
      serverlessFunction: { metadataName: 'serverlessFunction' },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  databaseEventTrigger: {
    manyToOne: {
      serverlessFunction: { metadataName: 'serverlessFunction' },
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  routeTrigger: {
    manyToOne: {
      serverlessFunction: { metadataName: 'serverlessFunction' },
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
      role: { metadataName: 'role' },
      apiKey: null,
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  pageLayout: {
    manyToOne: {
      workspace: null,
      objectMetadata: { metadataName: 'objectMetadata' },
      application: null,
    },
    oneToMany: {
      tabs: { metadataName: 'pageLayoutTab' },
    },
  },
  pageLayoutTab: {
    manyToOne: {
      workspace: null,
      pageLayout: { metadataName: 'pageLayout' },
      application: null,
    },
    oneToMany: {
      widgets: { metadataName: 'pageLayoutWidget' },
    },
  },
  pageLayoutWidget: {
    manyToOne: {
      workspace: null,
      pageLayoutTab: { metadataName: 'pageLayoutTab' },
      objectMetadata: { metadataName: 'objectMetadata' },
      application: null,
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicate: {
    manyToOne: {
      workspace: null,
      role: { metadataName: 'role' },
      fieldMetadata: { metadataName: 'fieldMetadata' },
      workspaceMemberFieldMetadata: { metadataName: 'fieldMetadata' },
      objectMetadata: { metadataName: 'objectMetadata' },
      rowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
      },
      application: null,
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicateGroup: {
    manyToOne: {
      workspace: null,
      role: { metadataName: 'role' },
      parentRowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
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
      >]: NonNullable<MetadataEntity<TName>[P]> extends SyncableEntity
        ? {
            metadataName: FromMetadataEntityToMetadataName<
              NonNullable<MetadataEntity<TName>[P]>
            >;
          }
        : null;
    };
    oneToMany: {
      [P in ExtractEntityOneToManyEntityRelationProperties<
        MetadataEntity<TName>
      >]: MetadataEntity<TName>[P] extends Relation<SyncableEntity[]>
        ? {
            metadataName: FromMetadataEntityToMetadataName<
              MetadataEntity<TName>[P][number]
            >;
          }
        : null;
    };
  };
};
