import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import {
  type CreateCronTriggerAction,
  type DeleteCronTriggerAction,
  type UpdateCronTriggerAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/types/workspace-migration-cron-trigger-action-v2.type';
import {
  type CreateDatabaseEventTriggerAction,
  type DeleteDatabaseEventTriggerAction,
  type UpdateDatabaseEventTriggerAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/types/workspace-migration-database-event-trigger-action-v2.type';
import {
  type CreateFieldAction,
  type DeleteFieldAction,
  type UpdateFieldAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import {
  type CreateIndexAction,
  type DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/types/workspace-migration-index-action-v2';
import {
  type CreateObjectAction,
  type DeleteObjectAction,
  type UpdateObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';
import {
  type CreateRouteTriggerAction,
  type DeleteRouteTriggerAction,
  type UpdateRouteTriggerAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/types/workspace-migration-route-trigger-action-v2.type';
import {
  type CreateServerlessFunctionAction,
  type DeleteServerlessFunctionAction,
  type UpdateServerlessFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import {
  type CreateViewFieldAction,
  type DeleteViewFieldAction,
  type UpdateViewFieldAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/workspace-migration-view-field-action-v2.type';
import {
  type CreateViewFilterAction,
  type DeleteViewFilterAction,
  type UpdateViewFilterAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/types/workspace-migration-view-filter-action-v2.type';
import {
  type CreateViewAction,
  type DeleteViewAction,
  type UpdateViewAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/types/workspace-migration-view-action-v2.type';

export type AllFlatEntitiesByMetadataEngineName = {
  fieldMetadata: FlatFieldMetadata;
  objectMetadata: FlatObjectMetadata;
  view: FlatView;
  viewField: FlatViewField;
  index: FlatIndexMetadata;
  serverlessFunction: FlatServerlessFunction;
  cronTrigger: FlatCronTrigger;
  databaseEventTrigger: FlatDatabaseEventTrigger;
  routeTrigger: FlatRouteTrigger;
  viewFilter: FlatViewFilter;
};

export type AllFlatEntitiesByMetadataEngineNameV2 = {
  fieldMetadata: {
    actions: {
      created: CreateFieldAction;
      updated: UpdateFieldAction;
      deleted: DeleteFieldAction;
    };
    flatEntity: FlatFieldMetadata;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.fieldMetadata;
  };
  objectMetadata: {
    actions: {
      created: CreateObjectAction;
      updated: UpdateObjectAction;
      deleted: DeleteObjectAction;
    };
    flatEntity: FlatObjectMetadata;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.objectMetadata;
  };
  view: {
    actions: {
      created: CreateViewAction;
      updated: UpdateViewAction;
      deleted: DeleteViewAction;
    };
    flatEntity: FlatView;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.view;
  };
  viewField: {
    actions: {
      created: CreateViewFieldAction;
      updated: UpdateViewFieldAction;
      deleted: DeleteViewFieldAction;
    };
    flatEntity: FlatViewField;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.viewField;
  };
  index: {
    actions: {
      created: CreateIndexAction;
      updated: never;
      deleted: DeleteIndexAction;
    };
    flatEntity: FlatIndexMetadata;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.index;
  };
  serverlessFunction: {
    actions: {
      created: CreateServerlessFunctionAction;
      updated: UpdateServerlessFunctionAction;
      deleted: DeleteServerlessFunctionAction;
    };
    flatEntity: FlatServerlessFunction;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.serverlessFunction;
  };
  cronTrigger: {
    actions: {
      created: CreateCronTriggerAction;
      updated: UpdateCronTriggerAction;
      deleted: DeleteCronTriggerAction;
    };
    flatEntity: FlatCronTrigger;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.cronTrigger;
  };
  databaseEventTrigger: {
    actions: {
      created: CreateDatabaseEventTriggerAction;
      updated: UpdateDatabaseEventTriggerAction;
      deleted: DeleteDatabaseEventTriggerAction;
    };
    flatEntity: FlatDatabaseEventTrigger;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.databaseEventTrigger;
  };
  routeTrigger: {
    actions: {
      created: CreateRouteTriggerAction;
      updated: UpdateRouteTriggerAction;
      deleted: DeleteRouteTriggerAction;
    };
    flatEntity: FlatRouteTrigger;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.routeTrigger;
  };
  viewFilter: {
    actions: {
      created: CreateViewFilterAction;
      updated: UpdateViewFilterAction;
      deleted: DeleteViewFilterAction;
    };
    flatEntity: FlatViewFilter;
    configuration: typeof ALL_FLAT_ENTITY_CONFIGURATION.viewFilter;
  };
};
