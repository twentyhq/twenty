import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';
import { type ExtractPropertiesThatEndsWithId } from 'twenty-shared/types';
import { type Relation } from 'typeorm';

import { type AddSuffixToEntityOneToManyProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-one-to-many-properties.type';
import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type AllJsonbPropertiesWithSerializedPropertiesForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-jsonb-properties-with-serialized-relation-by-metadata-name.constant';

export type MetadataManyToOneRelationConfiguration<
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
        flatEntityForeignKeyAggregator:
          | keyof AddSuffixToEntityOneToManyProperties<TTargetEntity, 'ids'>
          | null;
        foreignKey: ExtractPropertiesThatEndsWithId<
          MetadataEntity<TSourceMetadataName>,
          'id' | 'workspaceId'
        >;
        isNullable: null extends MetadataEntity<TSourceMetadataName>[TRelationProperty]
          ? true
          : false;
      }
    : // Note: In the best of the world should not be nullable, entities should always declare inverside keys
      null;

type OneToManyRelationValue<
  TSourceMetadataName extends AllMetadataName,
  TRelationProperty extends ExtractEntityOneToManyEntityRelationProperties<
    MetadataEntity<TSourceMetadataName>
  >,
> = MetadataEntity<TSourceMetadataName>[TRelationProperty] extends (infer TTargetEntity extends
  SyncableEntity)[]
  ? {
      metadataName: FromMetadataEntityToMetadataName<TTargetEntity>;
    }
  : null;

type MetadataRelationsProperties = {
  [TSourceMetadataName in AllMetadataName]: {
    manyToOne: {
      [TRelationProperty in ExtractEntityManyToOneEntityRelationProperties<
        MetadataEntity<TSourceMetadataName>
      >]: MetadataManyToOneRelationConfiguration<
        TSourceMetadataName,
        TRelationProperty
      >;
    };
    oneToMany: {
      [TRelationProperty in ExtractEntityOneToManyEntityRelationProperties<
        MetadataEntity<TSourceMetadataName>
      >]: OneToManyRelationValue<TSourceMetadataName, TRelationProperty>;
    };
  } & ([
    AllJsonbPropertiesWithSerializedPropertiesForMetadataName<TSourceMetadataName>,
  ] extends [never]
    ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}
    : {
        serializedRelations: Partial<Record<AllMetadataName, true>>;
      });
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
  commandMenuItem: {
    manyToOne: {
      workspace: null,
      application: null,
      availabilityObjectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'availabilityObjectMetadataId',
        isNullable: true,
      },
      frontComponent: {
        metadataName: 'frontComponent',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'frontComponentId',
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
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'targetObjectMetadataId',
        isNullable: true,
      },
      folder: {
        metadataName: 'navigationMenuItem',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'folderId',
        isNullable: true,
      },
      view: {
        metadataName: 'view',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'viewId',
        isNullable: true,
      },
    },
    oneToMany: {},
  },
  fieldMetadata: {
    manyToOne: {
      object: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: 'fieldIds',
        foreignKey: 'objectMetadataId',
        isNullable: false,
      },
      workspace: null,
      application: null,
      relationTargetFieldMetadata: {
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'relationTargetFieldMetadataId',
        isNullable: true,
      },
      relationTargetObjectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'relationTargetObjectMetadataId',
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
    serializedRelations: {
      fieldMetadata: true,
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
        isNullable: false,
      },
      workspace: null,
      createdBy: null,
      application: null,
      calendarFieldMetadata: {
        foreignKey: 'calendarFieldMetadataId',
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: 'calendarViewIds',
        isNullable: true,
      },
      kanbanAggregateOperationFieldMetadata: {
        foreignKey: 'kanbanAggregateOperationFieldMetadataId',
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: 'kanbanAggregateOperationViewIds',
        isNullable: true,
      },
      mainGroupByFieldMetadata: {
        foreignKey: 'mainGroupByFieldMetadataId',
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: 'mainGroupByFieldMetadataViewIds',
        isNullable: true,
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
        isNullable: false,
      },
      view: {
        metadataName: 'view',
        flatEntityForeignKeyAggregator: 'viewFieldIds',
        foreignKey: 'viewId',
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
        flatEntityForeignKeyAggregator: 'viewFilterIds',
        foreignKey: 'fieldMetadataId',
        isNullable: false,
      },
      view: {
        metadataName: 'view',
        flatEntityForeignKeyAggregator: 'viewFilterIds',
        foreignKey: 'viewId',
        isNullable: false,
      },
      viewFilterGroup: {
        flatEntityForeignKeyAggregator: 'viewFilterIds',
        foreignKey: 'viewFilterGroupId',
        metadataName: 'viewFilterGroup',
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
        flatEntityForeignKeyAggregator: 'viewGroupIds',
        foreignKey: 'viewId',
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
        flatEntityForeignKeyAggregator: 'indexMetadataIds',
        foreignKey: 'objectMetadataId',
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
        flatEntityForeignKeyAggregator: 'roleTargetIds',
        foreignKey: 'roleId',
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
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'objectMetadataId',
        isNullable: true,
      },
      application: null,
      defaultTabToFocusOnMobileAndSidePanel: {
        metadataName: 'pageLayoutTab',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'defaultTabToFocusOnMobileAndSidePanelId',
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
        flatEntityForeignKeyAggregator: 'tabIds',
        foreignKey: 'pageLayoutId',
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
        flatEntityForeignKeyAggregator: 'widgetIds',
        foreignKey: 'pageLayoutTabId',
        isNullable: false,
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'objectMetadataId',
        isNullable: true,
      },
      application: null,
    },
    oneToMany: {},
    serializedRelations: {
      fieldMetadata: true,
    },
  },
  rowLevelPermissionPredicate: {
    manyToOne: {
      workspace: null,
      role: {
        metadataName: 'role',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'roleId',
        isNullable: false,
      },
      fieldMetadata: {
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'fieldMetadataId',
        isNullable: false,
      },
      workspaceMemberFieldMetadata: {
        metadataName: 'fieldMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'workspaceMemberFieldMetadataId',
        isNullable: true,
      },
      objectMetadata: {
        metadataName: 'objectMetadata',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'objectMetadataId',
        isNullable: false,
      },
      rowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'rowLevelPermissionPredicateGroupId',
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
        flatEntityForeignKeyAggregator: null,
        foreignKey: 'objectMetadataId',
        isNullable: false,
      },
      role: {
        metadataName: 'role',
        foreignKey: 'roleId',
        flatEntityForeignKeyAggregator: null,
        isNullable: false,
      },
      parentRowLevelPermissionPredicateGroup: {
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKey: 'parentRowLevelPermissionPredicateGroupId',
        flatEntityForeignKeyAggregator:
          'childRowLevelPermissionPredicateGroupIds',
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
        flatEntityForeignKeyAggregator: 'childViewFilterGroupIds',
        foreignKey: 'parentViewFilterGroupId',
        metadataName: 'viewFilterGroup',
        isNullable: true,
      },
      view: {
        metadataName: 'view',
        flatEntityForeignKeyAggregator: 'viewFilterGroupIds',
        foreignKey: 'viewId',
        isNullable: false,
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
} as const satisfies MetadataRelationsProperties;

// Note: satisfies with complex mapped types involving nested generics doesn't always catch missing required keys
// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    AllMetadataName extends keyof typeof ALL_METADATA_RELATIONS ? true : false
  >,
];
