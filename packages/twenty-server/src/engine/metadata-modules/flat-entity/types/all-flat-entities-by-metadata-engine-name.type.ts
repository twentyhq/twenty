import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

/**
 * @deprecated REPLACE
 */
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

export type AllFlatEntityConfigurationByMetadataName = {
  fieldMetadata: {
    actions: {
      created: CreateFieldAction;
      updated: UpdateFieldAction;
      deleted: DeleteFieldAction;
    };
    flatEntity: FlatFieldMetadata;
    // Should be spread sibling instead of under configuration?
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

export type AllMetadataName = keyof AllFlatEntityConfigurationByMetadataName;

export type MetadataRelatedFlatEntityMapsKeys<T extends AllMetadataName> =
  AllFlatEntityConfigurationByMetadataName[T]['configuration']['relatedFlatEntityMapsKeys'][number];

export type MetadataRelatedFlatEntityMaps<T extends AllMetadataName> = Pick<
  AllFlatEntityMaps,
  MetadataRelatedFlatEntityMapsKeys<T>
>;

export type MetadataFlatEntity<T extends AllMetadataName> =
  AllFlatEntityConfigurationByMetadataName[T]['flatEntity'];

export type MetadataFlatEntityMaps<T extends AllMetadataName> = FlatEntityMaps<
  MetadataFlatEntity<T>
>;

export type MetadataWorkspaceMigrationActionsRecord<T extends AllMetadataName> =
  AllFlatEntityConfigurationByMetadataName[T]['actions'];

export type MetadataWorkspaceMigrationAction<
  T extends AllMetadataName,
  TOperation extends 'created' | 'deleted' | 'updated' =
    | 'created'
    | 'deleted'
    | 'updated',
> = MetadataWorkspaceMigrationActionsRecord<T>[TOperation];
