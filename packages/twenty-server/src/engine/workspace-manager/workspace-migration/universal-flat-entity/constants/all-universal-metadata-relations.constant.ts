import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';

export type ToUniversalForeignKey<T extends string> =
  T extends `${infer Prefix}Id` ? `${Prefix}UniversalIdentifier` : never;

type ToUniversalAggregator<T extends string> = T extends `${infer Prefix}Ids`
  ? `${Prefix}UniversalIdentifiers`
  : never;

export type ToUniversalMetadataManyToOneRelationConfiguration<T> = T extends {
  metadataName: infer M extends AllMetadataName;
  foreignKey: infer FK extends string;
  flatEntityForeignKeyAggregator: infer Agg;
  isNullable: infer N extends boolean;
}
  ? {
      metadataName: M;
      foreignKey: FK;
      universalForeignKey: ToUniversalForeignKey<FK>;
      universalFlatEntityForeignKeyAggregator: Agg extends string
        ? ToUniversalAggregator<Agg>
        : null;
      isNullable: N;
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
        isNullable: true,
      },
      frontComponent: {
        metadataName: 'frontComponent',
        foreignKey: 'frontComponentId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'frontComponentUniversalIdentifier',
        isNullable: true,
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
        isNullable: true,
      },
      folder: {
        metadataName: 'navigationMenuItem',
        foreignKey: 'folderId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'folderUniversalIdentifier',
        isNullable: true,
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'viewUniversalIdentifier',
        isNullable: true,
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
        isNullable: false,
      },
      workspace: null,
      application: null,
      relationTargetFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'relationTargetFieldMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'relationTargetFieldMetadataUniversalIdentifier',
        isNullable: true,
      },
      relationTargetObjectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: 'relationTargetObjectMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'relationTargetObjectMetadataUniversalIdentifier',
        isNullable: true,
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
        isNullable: false,
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
        isNullable: true,
      },
      kanbanAggregateOperationFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'kanbanAggregateOperationFieldMetadataId',
        universalFlatEntityForeignKeyAggregator:
          'kanbanAggregateOperationViewUniversalIdentifiers',
        universalForeignKey:
          'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
        isNullable: true,
      },
      mainGroupByFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'mainGroupByFieldMetadataId',
        universalFlatEntityForeignKeyAggregator:
          'mainGroupByFieldMetadataViewUniversalIdentifiers',
        universalForeignKey: 'mainGroupByFieldMetadataUniversalIdentifier',
        isNullable: true,
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
        isNullable: false,
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewId',
        universalFlatEntityForeignKeyAggregator:
          'viewFieldUniversalIdentifiers',
        universalForeignKey: 'viewUniversalIdentifier',
        isNullable: false,
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
        isNullable: false,
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewId',
        universalFlatEntityForeignKeyAggregator:
          'viewFilterUniversalIdentifiers',
        universalForeignKey: 'viewUniversalIdentifier',
        isNullable: false,
      },
      viewFilterGroup: {
        metadataName: 'viewFilterGroup',
        foreignKey: 'viewFilterGroupId',
        universalFlatEntityForeignKeyAggregator:
          'viewFilterUniversalIdentifiers',
        universalForeignKey: 'viewFilterGroupUniversalIdentifier',
        isNullable: true,
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
        isNullable: false,
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
        isNullable: false,
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
        isNullable: false,
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
        isNullable: true,
      },
      application: null,
      defaultTabToFocusOnMobileAndSidePanel: {
        metadataName: 'pageLayoutTab',
        foreignKey: 'defaultTabToFocusOnMobileAndSidePanelId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey:
          'defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier',
        isNullable: true,
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
        isNullable: false,
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
        isNullable: false,
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: 'objectMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
        isNullable: true,
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
        isNullable: false,
      },
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'fieldMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'fieldMetadataUniversalIdentifier',
        isNullable: false,
      },
      workspaceMemberFieldMetadata: {
        metadataName: 'fieldMetadata',
        foreignKey: 'workspaceMemberFieldMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'workspaceMemberFieldMetadataUniversalIdentifier',
        isNullable: true,
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        foreignKey: 'objectMetadataId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'objectMetadataUniversalIdentifier',
        isNullable: false,
      },
      rowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKey: 'rowLevelPermissionPredicateGroupId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey:
          'rowLevelPermissionPredicateGroupUniversalIdentifier',
        isNullable: true,
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
        isNullable: false,
      },
      role: {
        metadataName: 'role',
        foreignKey: 'roleId',
        universalFlatEntityForeignKeyAggregator: null,
        universalForeignKey: 'roleUniversalIdentifier',
        isNullable: false,
      },
      parentRowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKey: 'parentRowLevelPermissionPredicateGroupId',
        universalFlatEntityForeignKeyAggregator:
          'childRowLevelPermissionPredicateGroupUniversalIdentifiers',
        universalForeignKey:
          'parentRowLevelPermissionPredicateGroupUniversalIdentifier',
        isNullable: true,
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
        isNullable: true,
      },
      view: {
        metadataName: 'view',
        foreignKey: 'viewId',
        universalFlatEntityForeignKeyAggregator:
          'viewFilterGroupUniversalIdentifiers',
        universalForeignKey: 'viewUniversalIdentifier',
        isNullable: false,
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
