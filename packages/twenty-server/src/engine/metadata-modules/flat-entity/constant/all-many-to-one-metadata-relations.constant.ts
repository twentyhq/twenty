import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';
import { type Relation } from 'typeorm';

import { type ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-foreign-key.constant';
import { type ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type ToUniversalForeignKey } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/to-universal-foreign-key.type';

type FromRelationPropertyToForeignKey<
  TMetadataName extends AllMetadataName,
  TRelationProperty extends PropertyKey,
> = TRelationProperty extends keyof (typeof ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY)[TMetadataName]
  ? (typeof ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY)[TMetadataName][TRelationProperty] extends {
      foreignKey: infer FK extends string;
    }
    ? FK
    : never
  : never;

type ManyToOneRelationValue<
  TSourceMetadataName extends AllMetadataName,
  TRelationProperty extends ExtractEntityManyToOneEntityRelationProperties<
    MetadataEntity<TSourceMetadataName>
  >,
> =
  NonNullable<
    MetadataEntity<TSourceMetadataName>[TRelationProperty]
  > extends Relation<infer TTargetEntity extends SyncableEntity>
    ? FromMetadataEntityToMetadataName<TTargetEntity> extends infer TTargetMetadataName extends
        AllMetadataName
      ? FromRelationPropertyToForeignKey<
          TSourceMetadataName,
          TRelationProperty
        > extends infer FK
        ? {
            metadataName: TTargetMetadataName;
            foreignKey: FK;
            // Should not be nullable, in the best of the world relation should always describe an inverse property
            inverseOneToManyProperty:
              | keyof (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[TTargetMetadataName]
              | null;
            isNullable: null extends MetadataEntity<TSourceMetadataName>[TRelationProperty]
              ? true
              : false;
            universalForeignKey: ToUniversalForeignKey<FK & string>;
          }
        : never
      : never
    : null;

type ManyToOneMetadataRelationsProperties = {
  [TSourceMetadataName in AllMetadataName]: {
    [TRelationProperty in ExtractEntityManyToOneEntityRelationProperties<
      MetadataEntity<TSourceMetadataName>
    >]: ManyToOneRelationValue<TSourceMetadataName, TRelationProperty>;
  };
};

export const ALL_MANY_TO_ONE_METADATA_RELATIONS = {
  agent: {
    workspace: null,
    application: null,
  },
  skill: {
    workspace: null,
    application: null,
  },
  commandMenuItem: {
    workspace: null,
    application: null,
    availabilityObjectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'availabilityObjectMetadataId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'availabilityObjectMetadataUniversalIdentifier',
    },
    frontComponent: {
      metadataName: 'frontComponent',
      foreignKey: 'frontComponentId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'frontComponentUniversalIdentifier',
    },
  },
  navigationMenuItem: {
    workspace: null,
    userWorkspace: null,
    application: null,
    targetObjectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'targetObjectMetadataId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'targetObjectMetadataUniversalIdentifier',
    },
    folder: {
      metadataName: 'navigationMenuItem',
      foreignKey: 'folderId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'folderUniversalIdentifier',
    },
    view: {
      metadataName: 'view',
      foreignKey: 'viewId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'viewUniversalIdentifier',
    },
  },
  fieldMetadata: {
    object: {
      metadataName: 'objectMetadata',
      foreignKey: 'objectMetadataId',
      inverseOneToManyProperty: 'fields',
      isNullable: false,
      universalForeignKey: 'objectMetadataUniversalIdentifier',
    },
    workspace: null,
    application: null,
    relationTargetFieldMetadata: {
      metadataName: 'fieldMetadata',
      foreignKey: 'relationTargetFieldMetadataId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'relationTargetFieldMetadataUniversalIdentifier',
    },
    relationTargetObjectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'relationTargetObjectMetadataId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'relationTargetObjectMetadataUniversalIdentifier',
    },
  },
  objectMetadata: {
    dataSource: null,
    workspace: null,
    application: null,
  },
  view: {
    objectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'objectMetadataId',
      inverseOneToManyProperty: 'views',
      isNullable: false,
      universalForeignKey: 'objectMetadataUniversalIdentifier',
    },
    workspace: null,
    createdBy: null,
    application: null,
    calendarFieldMetadata: {
      metadataName: 'fieldMetadata',
      foreignKey: 'calendarFieldMetadataId',
      inverseOneToManyProperty: 'calendarViews',
      isNullable: true,
      universalForeignKey: 'calendarFieldMetadataUniversalIdentifier',
    },
    kanbanAggregateOperationFieldMetadata: {
      metadataName: 'fieldMetadata',
      foreignKey: 'kanbanAggregateOperationFieldMetadataId',
      inverseOneToManyProperty: 'kanbanAggregateOperationViews',
      isNullable: true,
      universalForeignKey:
        'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
    },
    mainGroupByFieldMetadata: {
      metadataName: 'fieldMetadata',
      foreignKey: 'mainGroupByFieldMetadataId',
      inverseOneToManyProperty: 'mainGroupByFieldMetadataViews',
      isNullable: true,
      universalForeignKey: 'mainGroupByFieldMetadataUniversalIdentifier',
    },
  },
  viewField: {
    fieldMetadata: {
      metadataName: 'fieldMetadata',
      foreignKey: 'fieldMetadataId',
      inverseOneToManyProperty: 'viewFields',
      isNullable: false,
      universalForeignKey: 'fieldMetadataUniversalIdentifier',
    },
    view: {
      metadataName: 'view',
      foreignKey: 'viewId',
      inverseOneToManyProperty: 'viewFields',
      isNullable: false,
      universalForeignKey: 'viewUniversalIdentifier',
    },
    viewFieldGroup: {
      metadataName: 'viewFieldGroup',
      foreignKey: 'viewFieldGroupId',
      inverseOneToManyProperty: 'viewFields',
      isNullable: true,
      universalForeignKey: 'viewFieldGroupUniversalIdentifier',
    },
    workspace: null,
    application: null,
  },
  viewFieldGroup: {
    view: {
      metadataName: 'view',
      foreignKey: 'viewId',
      inverseOneToManyProperty: 'viewFieldGroups',
      isNullable: false,
      universalForeignKey: 'viewUniversalIdentifier',
    },
    workspace: null,
    application: null,
  },
  viewFilter: {
    fieldMetadata: {
      metadataName: 'fieldMetadata',
      foreignKey: 'fieldMetadataId',
      inverseOneToManyProperty: 'viewFilters',
      isNullable: false,
      universalForeignKey: 'fieldMetadataUniversalIdentifier',
    },
    view: {
      metadataName: 'view',
      foreignKey: 'viewId',
      inverseOneToManyProperty: 'viewFilters',
      isNullable: false,
      universalForeignKey: 'viewUniversalIdentifier',
    },
    viewFilterGroup: {
      metadataName: 'viewFilterGroup',
      foreignKey: 'viewFilterGroupId',
      inverseOneToManyProperty: 'viewFilters',
      isNullable: true,
      universalForeignKey: 'viewFilterGroupUniversalIdentifier',
    },
    workspace: null,
    application: null,
  },
  viewGroup: {
    view: {
      metadataName: 'view',
      foreignKey: 'viewId',
      inverseOneToManyProperty: 'viewGroups',
      isNullable: false,
      universalForeignKey: 'viewUniversalIdentifier',
    },
    workspace: null,
    application: null,
  },
  index: {
    objectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'objectMetadataId',
      inverseOneToManyProperty: 'indexMetadatas',
      isNullable: false,
      universalForeignKey: 'objectMetadataUniversalIdentifier',
    },
    workspace: null,
    application: null,
  },
  logicFunction: {
    workspace: null,
    application: null,
  },
  role: {
    workspace: null,
    application: null,
  },
  roleTarget: {
    role: {
      metadataName: 'role',
      foreignKey: 'roleId',
      inverseOneToManyProperty: 'roleTargets',
      isNullable: false,
      universalForeignKey: 'roleUniversalIdentifier',
    },
    apiKey: null,
    workspace: null,
    application: null,
  },
  pageLayout: {
    workspace: null,
    objectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'objectMetadataId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'objectMetadataUniversalIdentifier',
    },
    application: null,
    defaultTabToFocusOnMobileAndSidePanel: {
      metadataName: 'pageLayoutTab',
      foreignKey: 'defaultTabToFocusOnMobileAndSidePanelId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey:
        'defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier',
    },
  },
  pageLayoutTab: {
    workspace: null,
    pageLayout: {
      metadataName: 'pageLayout',
      foreignKey: 'pageLayoutId',
      inverseOneToManyProperty: 'tabs',
      isNullable: false,
      universalForeignKey: 'pageLayoutUniversalIdentifier',
    },
    application: null,
  },
  pageLayoutWidget: {
    workspace: null,
    pageLayoutTab: {
      metadataName: 'pageLayoutTab',
      foreignKey: 'pageLayoutTabId',
      inverseOneToManyProperty: 'widgets',
      isNullable: false,
      universalForeignKey: 'pageLayoutTabUniversalIdentifier',
    },
    objectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'objectMetadataId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'objectMetadataUniversalIdentifier',
    },
    application: null,
  },
  rowLevelPermissionPredicate: {
    workspace: null,
    role: {
      metadataName: 'role',
      foreignKey: 'roleId',
      inverseOneToManyProperty: 'rowLevelPermissionPredicates',
      isNullable: false,
      universalForeignKey: 'roleUniversalIdentifier',
    },
    fieldMetadata: {
      metadataName: 'fieldMetadata',
      foreignKey: 'fieldMetadataId',
      inverseOneToManyProperty: null,
      isNullable: false,
      universalForeignKey: 'fieldMetadataUniversalIdentifier',
    },
    workspaceMemberFieldMetadata: {
      metadataName: 'fieldMetadata',
      foreignKey: 'workspaceMemberFieldMetadataId',
      inverseOneToManyProperty: null,
      isNullable: true,
      universalForeignKey: 'workspaceMemberFieldMetadataUniversalIdentifier',
    },
    objectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'objectMetadataId',
      inverseOneToManyProperty: null,
      isNullable: false,
      universalForeignKey: 'objectMetadataUniversalIdentifier',
    },
    rowLevelPermissionPredicateGroup: {
      metadataName: 'rowLevelPermissionPredicateGroup',
      foreignKey: 'rowLevelPermissionPredicateGroupId',
      inverseOneToManyProperty: 'rowLevelPermissionPredicates',
      isNullable: true,
      universalForeignKey:
        'rowLevelPermissionPredicateGroupUniversalIdentifier',
    },
    application: null,
  },
  rowLevelPermissionPredicateGroup: {
    objectMetadata: {
      metadataName: 'objectMetadata',
      foreignKey: 'objectMetadataId',
      inverseOneToManyProperty: null,
      isNullable: false,
      universalForeignKey: 'objectMetadataUniversalIdentifier',
    },
    role: {
      metadataName: 'role',
      foreignKey: 'roleId',
      inverseOneToManyProperty: 'rowLevelPermissionPredicateGroups',
      isNullable: false,
      universalForeignKey: 'roleUniversalIdentifier',
    },
    parentRowLevelPermissionPredicateGroup: {
      metadataName: 'rowLevelPermissionPredicateGroup',
      foreignKey: 'parentRowLevelPermissionPredicateGroupId',
      inverseOneToManyProperty: 'childRowLevelPermissionPredicateGroups',
      isNullable: true,
      universalForeignKey:
        'parentRowLevelPermissionPredicateGroupUniversalIdentifier',
    },
    workspace: null,
    application: null,
  },
  viewFilterGroup: {
    application: null,
    parentViewFilterGroup: {
      metadataName: 'viewFilterGroup',
      foreignKey: 'parentViewFilterGroupId',
      inverseOneToManyProperty: 'childViewFilterGroups',
      isNullable: true,
      universalForeignKey: 'parentViewFilterGroupUniversalIdentifier',
    },
    view: {
      metadataName: 'view',
      foreignKey: 'viewId',
      inverseOneToManyProperty: 'viewFilterGroups',
      isNullable: false,
      universalForeignKey: 'viewUniversalIdentifier',
    },
    workspace: null,
  },
  frontComponent: {
    workspace: null,
    application: null,
  },
  webhook: {
    workspace: null,
    application: null,
  },
} as const satisfies ManyToOneMetadataRelationsProperties;

// satisfies with complex mapped types involving nested generics doesn't always catch missing required keys
// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    AllMetadataName extends keyof typeof ALL_MANY_TO_ONE_METADATA_RELATIONS
      ? true
      : false
  >,
];
