import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';
import { type ExtractPropertiesThatEndsWithId } from 'twenty-shared/types';
import { type Relation } from 'typeorm';

import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

type ManyToOneRelationConfiguration<
  TSourceMetadataName extends AllMetadataName,
  TRelationProperty extends ExtractEntityManyToOneEntityRelationProperties<
    MetadataEntity<TSourceMetadataName>
  >,
> =
  NonNullable<
    MetadataEntity<TSourceMetadataName>[TRelationProperty]
  > extends Relation<infer _TTargetEntity extends SyncableEntity>
    ? {
        foreignKey: ExtractPropertiesThatEndsWithId<
          MetadataEntity<TSourceMetadataName>,
          'id' | 'workspaceId'
        >;
      }
    : null;

type ManyToOneMetadataRelationsProperties = {
  [TSourceMetadataName in AllMetadataName]: {
    [TRelationProperty in ExtractEntityManyToOneEntityRelationProperties<
      MetadataEntity<TSourceMetadataName>
    >]: ManyToOneRelationConfiguration<TSourceMetadataName, TRelationProperty>;
  };
};

export const ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY = {
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
      foreignKey: 'availabilityObjectMetadataId',
    },
    frontComponent: {
      foreignKey: 'frontComponentId',
    },
  },
  navigationMenuItem: {
    workspace: null,
    userWorkspace: null,
    application: null,
    targetObjectMetadata: {
      foreignKey: 'targetObjectMetadataId',
    },
    folder: {
      foreignKey: 'folderId',
    },
    view: {
      foreignKey: 'viewId',
    },
  },
  fieldMetadata: {
    object: {
      foreignKey: 'objectMetadataId',
    },
    workspace: null,
    application: null,
    relationTargetFieldMetadata: {
      foreignKey: 'relationTargetFieldMetadataId',
    },
    relationTargetObjectMetadata: {
      foreignKey: 'relationTargetObjectMetadataId',
    },
  },
  objectMetadata: {
    dataSource: null,
    workspace: null,
    application: null,
  },
  view: {
    objectMetadata: {
      foreignKey: 'objectMetadataId',
    },
    workspace: null,
    createdBy: null,
    application: null,
    calendarFieldMetadata: {
      foreignKey: 'calendarFieldMetadataId',
    },
    kanbanAggregateOperationFieldMetadata: {
      foreignKey: 'kanbanAggregateOperationFieldMetadataId',
    },
    mainGroupByFieldMetadata: {
      foreignKey: 'mainGroupByFieldMetadataId',
    },
  },
  viewField: {
    fieldMetadata: {
      foreignKey: 'fieldMetadataId',
    },
    view: {
      foreignKey: 'viewId',
    },
    viewFieldGroup: {
      foreignKey: 'viewFieldGroupId',
    },
    workspace: null,
    application: null,
  },
  viewFieldGroup: {
    view: {
      foreignKey: 'viewId',
    },
    workspace: null,
    application: null,
  },
  viewFilter: {
    fieldMetadata: {
      foreignKey: 'fieldMetadataId',
    },
    view: {
      foreignKey: 'viewId',
    },
    viewFilterGroup: {
      foreignKey: 'viewFilterGroupId',
    },
    workspace: null,
    application: null,
  },
  viewGroup: {
    view: {
      foreignKey: 'viewId',
    },
    workspace: null,
    application: null,
  },
  index: {
    objectMetadata: {
      foreignKey: 'objectMetadataId',
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
      foreignKey: 'roleId',
    },
    apiKey: null,
    workspace: null,
    application: null,
  },
  pageLayout: {
    workspace: null,
    objectMetadata: {
      foreignKey: 'objectMetadataId',
    },
    application: null,
    defaultTabToFocusOnMobileAndSidePanel: {
      foreignKey: 'defaultTabToFocusOnMobileAndSidePanelId',
    },
  },
  pageLayoutTab: {
    workspace: null,
    pageLayout: {
      foreignKey: 'pageLayoutId',
    },
    application: null,
  },
  pageLayoutWidget: {
    workspace: null,
    pageLayoutTab: {
      foreignKey: 'pageLayoutTabId',
    },
    objectMetadata: {
      foreignKey: 'objectMetadataId',
    },
    application: null,
  },
  rowLevelPermissionPredicate: {
    workspace: null,
    role: {
      foreignKey: 'roleId',
    },
    fieldMetadata: {
      foreignKey: 'fieldMetadataId',
    },
    workspaceMemberFieldMetadata: {
      foreignKey: 'workspaceMemberFieldMetadataId',
    },
    objectMetadata: {
      foreignKey: 'objectMetadataId',
    },
    rowLevelPermissionPredicateGroup: {
      foreignKey: 'rowLevelPermissionPredicateGroupId',
    },
    application: null,
  },
  rowLevelPermissionPredicateGroup: {
    objectMetadata: {
      foreignKey: 'objectMetadataId',
    },
    role: {
      foreignKey: 'roleId',
    },
    parentRowLevelPermissionPredicateGroup: {
      foreignKey: 'parentRowLevelPermissionPredicateGroupId',
    },
    workspace: null,
    application: null,
  },
  viewFilterGroup: {
    application: null,
    parentViewFilterGroup: {
      foreignKey: 'parentViewFilterGroupId',
    },
    view: {
      foreignKey: 'viewId',
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
    AllMetadataName extends keyof typeof ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY
      ? true
      : false
  >,
];
