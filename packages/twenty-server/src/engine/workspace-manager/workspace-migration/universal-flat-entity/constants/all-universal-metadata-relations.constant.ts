import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';

type ToUniversalForeignKey<T extends string> = T extends `${infer Prefix}Id`
  ? `${Prefix}UniversalIdentifier`
  : never;

type ToUniversalAggregator<T extends string> = T extends `${infer Prefix}Ids`
  ? `${Prefix}UniversalIdentifiers`
  : never;

export type ToUniversalMetadataManyToOneRelationConfiguration<T> = T extends {
  metadataName: infer M extends AllMetadataName;
  foreignKey: infer FK extends string;
  flatEntityForeignKeyAggregator: infer Agg;
}
  ? {
      metadataName: M;
      foreignKey: FK;
      universalForeignKey: ToUniversalForeignKey<FK>;
      universalFlatEntityForeignKeyAggregator: Agg extends string
        ? ToUniversalAggregator<Agg>
        : null;
    }
  : null;

type ToUniversalManyToOneRelations<T> = {
  [K in keyof T]: ToUniversalMetadataManyToOneRelationConfiguration<T[K]>;
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
        foreignKey: 'availabilityObjectMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'availabilityObjectMetadataUniversalIdentifier',
      },
      frontComponent: {
        metadataName: 'frontComponent',
        foreignKey: 'frontComponentId',
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
        foreignKey: 'targetObjectMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'targetObjectMetadataUniversalIdentifier',
      },
      folder: {
        metadataName: 'navigationMenuItem',
        foreignKey: 'folderId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'folderUniversalIdentifier',
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewId',
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
        foreignKey: 'objectMetadataId',
        universalFlatEntityForeignKeyAggregator: 'fieldUniversalIdentifiers',
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      workspace: null,
      application: null,
      relationTargetFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'relationTargetFieldMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'relationTargetFieldMetadataUniversalIdentifier',
      },
      relationTargetObjectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: 'relationTargetObjectMetadataId',
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
        foreignKey: 'objectMetadataId',
        universalFlatEntityForeignKeyAggregator: 'viewUniversalIdentifiers',
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      workspace: null,
      createdBy: null,
      application: null,
      calendarFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'calendarFieldMetadataId',
        universalFlatEntityForeignKeyAggregator:
          'calendarViewUniversalIdentifiers',
        universalForeignKey: 'calendarFieldMetadataUniversalIdentifier',
      },
      kanbanAggregateOperationFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'kanbanAggregateOperationFieldMetadataId',
        universalFlatEntityForeignKeyAggregator:
          'kanbanAggregateOperationViewUniversalIdentifiers',
        universalForeignKey:
          'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
      },
      mainGroupByFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'mainGroupByFieldMetadataId',
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
        foreignKey: 'fieldMetadataId',
        universalFlatEntityForeignKeyAggregator:
          'viewFieldUniversalIdentifiers',
        universalForeignKey: 'fieldMetadataUniversalIdentifier',
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewId',
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
        foreignKey: 'fieldMetadataId',
        universalFlatEntityForeignKeyAggregator:
          'viewFilterUniversalIdentifiers',
        universalForeignKey: 'fieldMetadataUniversalIdentifier',
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewId',
        universalFlatEntityForeignKeyAggregator:
          'viewFilterUniversalIdentifiers',
        universalForeignKey: 'viewUniversalIdentifier',
      },
      viewFilterGroup: {
        metadataName: 'viewFilterGroup',
        foreignKey: 'viewFilterGroupId',
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
        foreignKey: 'viewId',
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
        foreignKey: 'objectMetadataId',
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
        foreignKey: 'roleId',
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
        foreignKey: 'objectMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      application: null,
      defaultTabToFocusOnMobileAndSidePanel: {
        metadataName: 'pageLayoutTab',
        foreignKey: 'defaultTabToFocusOnMobileAndSidePanelId',
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
        foreignKey: 'pageLayoutId',
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
        foreignKey: 'pageLayoutTabId',
        universalFlatEntityForeignKeyAggregator: 'widgetUniversalIdentifiers',
        universalForeignKey: 'pageLayoutTabUniversalIdentifier',
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: 'objectMetadataId',
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
        foreignKey: 'roleId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'roleUniversalIdentifier',
      },
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'fieldMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'fieldMetadataUniversalIdentifier',
      },
      workspaceMemberFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'workspaceMemberFieldMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'workspaceMemberFieldMetadataUniversalIdentifier',
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: 'objectMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      rowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKey: 'rowLevelPermissionPredicateGroupId',
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
        foreignKey: 'objectMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
      },
      role: {
        metadataName: 'role',
        foreignKey: 'roleId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'roleUniversalIdentifier',
      },
      parentRowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKey: 'parentRowLevelPermissionPredicateGroupId',
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
        foreignKey: 'parentViewFilterGroupId',
        universalFlatEntityForeignKeyAggregator:
          'childViewFilterGroupUniversalIdentifiers',
        universalForeignKey: 'parentViewFilterGroupUniversalIdentifier',
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewId',
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
