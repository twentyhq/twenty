import { FLAT_CRON_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/cron-trigger/constants/flat-cron-trigger-editable-properties.constant';
import { FLAT_DATABASE_EVENT_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/database-event-trigger/constants/flat-database-event-trigger-editable-properties.constant';
import { type AllFlatEntitiesByMetadataEngineName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllFlatEntities } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities.type';
import { type FromMetadataEngineNameToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-engine-name-to-flat-entity-maps-key.type';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { FLAT_VIEW_FIELD_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field/constants/flat-view-field-editable-properties.constant';
import { FLAT_VIEW_FILTER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-editable-properties.constant';
import { FLAT_VIEW_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant';
import { FLAT_ROUTE_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/route-trigger/constants/flat-route-trigger-editable-properties.constant';
import { FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/serverless-function/constants/flat-serverless-function-editable-properties.constant';

type OneFlatEntityConstants<
  TFlatEntity extends AllFlatEntities,
  TFlatEntityName extends keyof AllFlatEntitiesByMetadataEngineName,
> = {
  propertiesToCompare: (keyof TFlatEntity)[];
  propertiesToStringify: (keyof TFlatEntity)[];
  flatEntityMapsKey: FromMetadataEngineNameToFlatEntityMapsKey<TFlatEntityName>;
};

export const ALL_FLAT_ENTITY_CONSTANTS = {
  fieldMetadata: {
    flatEntityMapsKey: 'flatFieldMetadataMaps',
    propertiesToCompare: [
      ...FLAT_FIELD_METADATA_EDITABLE_PROPERTIES,
      'standardOverrides',
    ],
    propertiesToStringify: [
      'options',
      'settings',
      'standardOverrides',
      'defaultValue',
    ],
  },
  objectMetadata: {
    flatEntityMapsKey: 'flatObjectMetadataMaps',
    propertiesToCompare: [
      'description',
      'icon',
      'isActive',
      'isLabelSyncedWithName',
      'labelPlural',
      'labelSingular',
      'namePlural',
      'nameSingular',
      'standardOverrides',
      'labelIdentifierFieldMetadataId',
    ],
    propertiesToStringify: ['standardOverrides'],
  },
  view: {
    flatEntityMapsKey: 'flatViewMaps',
    propertiesToCompare: [
      'key',
      'deletedAt',
      ...FLAT_VIEW_EDITABLE_PROPERTIES,
    ],
    propertiesToStringify: [],
  },
  viewField: {
    flatEntityMapsKey: 'flatViewFieldMaps',
    propertiesToCompare: [
      ...FLAT_VIEW_FIELD_EDITABLE_PROPERTIES,
      'deletedAt',
    ],
    propertiesToStringify: [],
  },
  index: {
    flatEntityMapsKey: 'flatIndexMaps',
    propertiesToCompare: [
      'indexType',
      'indexWhereClause',
      'flatIndexFieldMetadatas',
      'isUnique',
      'name',
    ],
    propertiesToStringify: ['flatIndexFieldMetadatas'],
  },
  serverlessFunction: {
    flatEntityMapsKey: 'flatServerlessFunctionMaps',
    propertiesToCompare: [
      ...FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES,
      'deletedAt',
    ],
    propertiesToStringify: [],
  },
  cronTrigger: {
    flatEntityMapsKey: 'flatCronTriggerMaps',
    propertiesToCompare: [...FLAT_CRON_TRIGGER_EDITABLE_PROPERTIES],
    propertiesToStringify: ['settings'],
  },
  databaseEventTrigger: {
    flatEntityMapsKey: 'flatDatabaseEventTriggerMaps',
    propertiesToCompare: [...FLAT_DATABASE_EVENT_TRIGGER_EDITABLE_PROPERTIES],
    propertiesToStringify: ['settings'],
  },
  routeTrigger: {
    flatEntityMapsKey: 'flatRouteTriggerMaps',
    propertiesToCompare: [...FLAT_ROUTE_TRIGGER_EDITABLE_PROPERTIES],
    propertiesToStringify: [],
  },
  viewFilter: {
    flatEntityMapsKey: 'flatViewFilterMaps',
    propertiesToCompare: [
      'viewId',
      'deletedAt',
      ...FLAT_VIEW_FILTER_EDITABLE_PROPERTIES,
    ],
    propertiesToStringify: ['value'],
  },
} as const satisfies {
  [P in keyof AllFlatEntitiesByMetadataEngineName]: OneFlatEntityConstants<
    AllFlatEntitiesByMetadataEngineName[P],
    P
  >;
};