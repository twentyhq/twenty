import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';

type ToUniversalForeignKey<T extends string> = T extends `${infer Prefix}Id`
  ? `${Prefix}UniversalIdentifier`
  : never;

type ToUniversalAggregator<T extends string> = T extends `${infer Prefix}Ids`
  ? `${Prefix}UniversalIdentifiers`
  : never;

type ToUniversalManyToOneRelationValue<T> = T extends {
  metadataName: infer M extends AllMetadataName;
  foreignKey: infer FK extends string;
  flatEntityForeignKeyAggregator: infer Agg;
}
  ? {
      metadataName: M;
      universalForeignKey: ToUniversalForeignKey<FK>;
      universalFlatEntityForeignKeyAggregator: Agg extends string
        ? ToUniversalAggregator<Agg>
        : null;
    }
  : null;

type ToUniversalManyToOneRelations<T> = {
  [K in keyof T]: ToUniversalManyToOneRelationValue<T[K]>;
};

type ToUniversalOneToManyRelations<T> = T;

export type UniversalMetadataRelationsProperties = {
  [M in AllMetadataName]: {
    manyToOne: ToUniversalManyToOneRelations<
      (typeof ALL_METADATA_RELATIONS)[M]['manyToOne']
    >;
    oneToMany: ToUniversalOneToManyRelations<
      (typeof ALL_METADATA_RELATIONS)[M]['oneToMany']
    >;
  };
};

export const ALL_UNIVERSAL_METADATA_RELATIONS = {
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
  commandMenuItem: {
    manyToOne: {
      workspace: null,
      application: null,
      availabilityObjectMetadata: {
        metadataName: 'objectMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'availabilityObjectMetadataUniversalIdentifier',
      },
      frontComponent: {
        metadataName: 'frontComponent',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'frontComponentUniversalIdentifier',
      },
    },
    oneToMany: {},
  },
  navigationMenuItem: {
    manyToOne: {
      workspace: null,
      userWorkspace: null,
      application: null,
      targetObjectMetadata: {
        metadataName: 'objectMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'targetObjectMetadataUniversalIdentifier',
      },
      folder: {
        metadataName: 'navigationMenuItem',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'folderUniversalIdentifier',
      },
      view: {
        metadataName: 'view',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'viewUniversalIdentifier',
      },
    },
    oneToMany: {},
  },
  fieldMetadata: {
    manyToOne: {
      object: {
        metadataName: 'objectMetadata',
        universalFlatEntityForeignKeyAggregator: 'fieldUniversalIdentifiers',
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      workspace: null,
      application: null,
      relationTargetFieldMetadata: {
        metadataName: 'fieldMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'relationTargetFieldMetadataUniversalIdentifier',
      },
      relationTargetObjectMetadata: {
        metadataName: 'objectMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'relationTargetObjectMetadataUniversalIdentifier',
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
        universalFlatEntityForeignKeyAggregator: 'viewUniversalIdentifiers',
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      workspace: null,
      createdBy: null,
      application: null,
      calendarFieldMetadata: {
        metadataName: 'fieldMetadata',
        universalFlatEntityForeignKeyAggregator:
          'calendarViewUniversalIdentifiers',
        universalForeignKey: 'calendarFieldMetadataUniversalIdentifier',
      },
      kanbanAggregateOperationFieldMetadata: {
        metadataName: 'fieldMetadata',
        universalFlatEntityForeignKeyAggregator:
          'kanbanAggregateOperationViewUniversalIdentifiers',
        universalForeignKey:
          'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
      },
      mainGroupByFieldMetadata: {
        metadataName: 'fieldMetadata',
        universalFlatEntityForeignKeyAggregator:
          'mainGroupByFieldMetadataViewUniversalIdentifiers',
        universalForeignKey: 'mainGroupByFieldMetadataUniversalIdentifier',
      },
    },
    oneToMany: {
      viewFields: { metadataName: 'viewField' },
      viewFilters: { metadataName: 'viewFilter' },
      viewFilterGroups: { metadataName: 'viewFilterGroup' },
      viewGroups: { metadataName: 'viewGroup' },
      // TODO migrate viewSort to v2
      viewSorts: null,
    },
  },
  viewField: {
    manyToOne: {
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        universalFlatEntityForeignKeyAggregator:
          'viewFieldUniversalIdentifiers',
        universalForeignKey: 'fieldMetadataUniversalIdentifier',
      },
      view: {
        metadataName: 'view',
        universalFlatEntityForeignKeyAggregator:
          'viewFieldUniversalIdentifiers',
        universalForeignKey: 'viewUniversalIdentifier',
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
        universalFlatEntityForeignKeyAggregator:
          'viewFilterUniversalIdentifiers',
        universalForeignKey: 'fieldMetadataUniversalIdentifier',
      },
      view: {
        metadataName: 'view',
        universalFlatEntityForeignKeyAggregator:
          'viewFilterUniversalIdentifiers',
        universalForeignKey: 'viewUniversalIdentifier',
      },
      viewFilterGroup: {
        metadataName: 'viewFilterGroup',
        universalFlatEntityForeignKeyAggregator:
          'viewFilterUniversalIdentifiers',
        universalForeignKey: 'viewFilterGroupUniversalIdentifier',
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
        universalFlatEntityForeignKeyAggregator:
          'viewGroupUniversalIdentifiers',
        universalForeignKey: 'viewUniversalIdentifier',
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
        universalFlatEntityForeignKeyAggregator:
          'indexMetadataUniversalIdentifiers',
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      workspace: null,
      application: null,
    },
    oneToMany: {
      indexFieldMetadatas: null,
    },
  },
  logicFunction: {
    manyToOne: {
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
      rowLevelPermissionPredicates: {
        metadataName: 'rowLevelPermissionPredicate',
      },
      rowLevelPermissionPredicateGroups: {
        metadataName: 'rowLevelPermissionPredicateGroup',
      },
    },
  },
  roleTarget: {
    manyToOne: {
      role: {
        metadataName: 'role',
        universalFlatEntityForeignKeyAggregator:
          'roleTargetUniversalIdentifiers',
        universalForeignKey: 'roleUniversalIdentifier',
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
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      application: null,
      defaultTabToFocusOnMobileAndSidePanel: {
        metadataName: 'pageLayoutTab',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey:
          'defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier',
      },
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
        universalFlatEntityForeignKeyAggregator: 'tabUniversalIdentifiers',
        universalForeignKey: 'pageLayoutUniversalIdentifier',
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
        universalFlatEntityForeignKeyAggregator: 'widgetUniversalIdentifiers',
        universalForeignKey: 'pageLayoutTabUniversalIdentifier',
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
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
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'roleUniversalIdentifier',
      },
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'fieldMetadataUniversalIdentifier',
      },
      workspaceMemberFieldMetadata: {
        metadataName: 'fieldMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'workspaceMemberFieldMetadataUniversalIdentifier',
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      rowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey:
          'rowLevelPermissionPredicateGroupUniversalIdentifier',
      },
      application: null,
    },
    oneToMany: {},
  },
  rowLevelPermissionPredicateGroup: {
    manyToOne: {
      objectMetadata: {
        metadataName: 'objectMetadata',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      role: {
        metadataName: 'role',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'roleUniversalIdentifier',
      },
      parentRowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        universalFlatEntityForeignKeyAggregator:
          'childRowLevelPermissionPredicateGroupUniversalIdentifiers',
        universalForeignKey:
          'parentRowLevelPermissionPredicateGroupUniversalIdentifier',
      },
      workspace: null,
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
        metadataName: 'viewFilterGroup',
        universalFlatEntityForeignKeyAggregator:
          'childViewFilterGroupUniversalIdentifiers',
        universalForeignKey: 'parentViewFilterGroupUniversalIdentifier',
      },
      view: {
        metadataName: 'view',
        universalFlatEntityForeignKeyAggregator:
          'viewFilterGroupUniversalIdentifiers',
        universalForeignKey: 'viewUniversalIdentifier',
      },
      workspace: null,
    },
    oneToMany: {
      childViewFilterGroups: { metadataName: 'viewFilterGroup' },
      viewFilters: { metadataName: 'viewFilter' },
    },
  },
  frontComponent: {
    manyToOne: {
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
  webhook: {
    manyToOne: {
      workspace: null,
      application: null,
    },
    oneToMany: {},
  },
} as const satisfies UniversalMetadataRelationsProperties;
