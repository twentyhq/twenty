import { type CronTrigger } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { type DatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import { type ALL_METADATA_NAME_MANY_TO_ONE_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-many-to-one-relations.constant';
import { MetadataValidationRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FromMetadataNameToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-name-to-flat-entity-maps-key.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RouteTrigger } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';
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

export type AllFlatEntityConfigurationByMetadataName = {
  fieldMetadata: {
    actions: {
      created: CreateFieldAction;
      updated: UpdateFieldAction;
      deleted: DeleteFieldAction;
    };
    flatEntity: FlatFieldMetadata;
    entity: FieldMetadataEntity;
  };
  objectMetadata: {
    actions: {
      created: CreateObjectAction;
      updated: UpdateObjectAction;
      deleted: DeleteObjectAction;
    };
    flatEntity: FlatObjectMetadata;
    entity: ObjectMetadataEntity;
  };
  view: {
    actions: {
      created: CreateViewAction;
      updated: UpdateViewAction;
      deleted: DeleteViewAction;
    };
    flatEntity: FlatView;
    entity: ViewEntity;
  };
  viewField: {
    actions: {
      created: CreateViewFieldAction;
      updated: UpdateViewFieldAction;
      deleted: DeleteViewFieldAction;
    };
    flatEntity: FlatViewField;
    entity: ViewFieldEntity;
  };
  index: {
    actions: {
      created: CreateIndexAction;
      updated: [DeleteIndexAction, CreateIndexAction];
      deleted: DeleteIndexAction;
    };
    flatEntity: FlatIndexMetadata;
    entity: IndexMetadataEntity;
  };
  serverlessFunction: {
    actions: {
      created: CreateServerlessFunctionAction;
      updated: UpdateServerlessFunctionAction;
      deleted: DeleteServerlessFunctionAction;
    };
    flatEntity: FlatServerlessFunction;
    entity: ServerlessFunctionEntity;
  };
  cronTrigger: {
    actions: {
      created: CreateCronTriggerAction;
      updated: UpdateCronTriggerAction;
      deleted: DeleteCronTriggerAction;
    };
    flatEntity: FlatCronTrigger;
    entity: CronTrigger;
  };
  databaseEventTrigger: {
    actions: {
      created: CreateDatabaseEventTriggerAction;
      updated: UpdateDatabaseEventTriggerAction;
      deleted: DeleteDatabaseEventTriggerAction;
    };
    flatEntity: FlatDatabaseEventTrigger;
    entity: DatabaseEventTrigger;
  };
  routeTrigger: {
    actions: {
      created: CreateRouteTriggerAction;
      updated: UpdateRouteTriggerAction;
      deleted: DeleteRouteTriggerAction;
    };
    flatEntity: FlatRouteTrigger;
    entity: RouteTrigger;
  };
  viewFilter: {
    actions: {
      created: CreateViewFilterAction;
      updated: UpdateViewFilterAction;
      deleted: DeleteViewFilterAction;
    };
    flatEntity: FlatViewFilter;
    entity: ViewFilterEntity;
  };
};

export type MetadataFlatEntityMapsKey<T extends AllMetadataName> =
  FromMetadataNameToFlatEntityMapsKey<T>;

export type MetadataRelatedMetadataNames<T extends AllMetadataName> = Extract<
  keyof (typeof ALL_METADATA_NAME_MANY_TO_ONE_RELATIONS)[T],
  AllMetadataName
>;

export type MetadataRelatedFlatEntityMapsKeys<T extends AllMetadataName> =
  FromMetadataNameToFlatEntityMapsKey<MetadataRelatedMetadataNames<T>>;

export type MetadataFlatEntityAndRelatedFlatEntityMaps<
  T extends AllMetadataName,
> = Pick<
  AllFlatEntityMaps,
  MetadataRelatedFlatEntityMapsKeys<T> | MetadataFlatEntityMapsKey<T>
>;

export type MetadataValidationRelatedFlatEntityMaps<T extends AllMetadataName> =
  MetadataValidationRelatedMetadataNames<T> extends undefined
    ? undefined
    : Pick<
        AllFlatEntityMaps,
        FromMetadataNameToFlatEntityMapsKey<
          NonNullable<MetadataValidationRelatedMetadataNames<T>>
        >
      >;

export type MetadataFlatEntity<T extends AllMetadataName> =
  AllFlatEntityConfigurationByMetadataName[T]['flatEntity'];

export type MetadataEntity<T extends AllMetadataName> =
  AllFlatEntityConfigurationByMetadataName[T]['entity'];

export type MetadataFlatEntityMaps<T extends AllMetadataName> = FlatEntityMaps<
  MetadataFlatEntity<T>
>;

export type MetadataWorkspaceMigrationActionsRecord<T extends AllMetadataName> =
  {
    [K in 'created' | 'updated' | 'deleted']: MetadataWorkspaceMigrationAction<
      T,
      K
    >[];
  };

export type MetadataWorkspaceMigrationAction<
  T extends AllMetadataName,
  TOperation extends 'created' | 'deleted' | 'updated' =
    | 'created'
    | 'deleted'
    | 'updated',
> = AllFlatEntityConfigurationByMetadataName[T]['actions'][TOperation] extends infer Action
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Action extends any[]
    ? Action[number]
    : Action
  : never;

export type FromWorkspaceMigrationActionToMetadataName<TAction> = {
  [K in AllMetadataName]: TAction extends AllFlatEntityConfigurationByMetadataName[K]['actions'][
    | 'created'
    | 'deleted'
    | 'updated']
    ? K
    : never;
}[AllMetadataName];

export type FlatEntityPropertiesUpdates<T extends AllMetadataName> = Array<
  PropertyUpdate<
    MetadataFlatEntity<T>,
    Extract<
      (typeof ALL_FLAT_ENTITY_CONFIGURATION)[T]['propertiesToCompare'][number],
      keyof MetadataFlatEntity<T>
    >
  >
>;
