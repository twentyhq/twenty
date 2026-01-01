import { type AllMetadataName } from 'twenty-shared/metadata';
import { ExtractPropertiesThatEndsWithIds } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

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
      object: {
        metadataName: 'objectMetadata',
        foreignKey: 'fieldMetadataIds',
      },
      workspace: null,
      application: null,
      relationTargetFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: undefined,
      },
      relationTargetObjectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: undefined,
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
        metadataName: 'objectMetadata',
        foreignKey: 'viewIds',
      },
      workspace: null,
      createdBy: null,
      application: null,
      calendarFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'calendarViewIds',
      },
      kanbanAggregateOperationFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'kanbanAggregateOperationViewIds',
      },
      mainGroupByFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'mainGroupByFieldMetadataViewIds',
      },
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
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'viewFieldIds',
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewFieldIds',
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
        foreignKey: 'viewFilterIds',
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewFilterIds',
      },
      // @ts-expect-error TODO migrate viewFilterGroup to v2
      viewFilterGroup: null,
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  viewGroup: {
    manyToOne: {
      view: {
        metadataName: 'view',
        foreignKey: 'viewGroupIds',
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
        foreignKey: 'indexMetadataIds',
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
        foreignKey: 'cronTriggerIds',
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
        foreignKey: 'databaseEventTriggerIds',
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
        foreignKey: 'routeTriggerIds',
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
        foreignKey: 'roleTargetIds',
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
        foreignKey: undefined,
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
        foreignKey: 'tabIds',
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
        foreignKey: 'widgetIds',
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: undefined,
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
        foreignKey: undefined,
      },
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: undefined,
      },
      workspaceMemberFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: undefined,
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: undefined,
      },
      rowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKey: undefined,
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
        foreignKey: undefined,
      },
      parentRowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKey: 'childRowLevelPermissionPredicateGroupIds',
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
            foreignKey:
              | ExtractPropertiesThatEndsWithIds<
                  MetadataFlatEntity<
                    FromMetadataEntityToMetadataName<
                      NonNullable<MetadataEntity<TName>[P]>
                    >
                  >
                >
              | undefined;
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
