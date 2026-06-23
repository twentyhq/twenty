import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type ScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/scalar-flat-entity.type';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

// TypeORM date columns come back as Date instances, but the flat representation
// stores them as ISO strings (see CastRecordTypeOrmDatePropertiesToString).
// Absent columns (value `undefined`) are normalized to `null` so the flat entity
// always carries a stable key shape and never an `undefined` value.
const serializeScalarValue = (value: unknown): unknown => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value ?? null;
};

const BASE_SCALAR_PROPERTY_NAMES = [
  'id',
  'workspaceId',
  'applicationId',
  'universalIdentifier',
] as const;

// Allow-list counterpart to removePropertiesFromRecord: rather than forwarding
// every entity property except the known relations (deny-list), this forwards only
// the scalar columns registered in
// ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME plus the always-present base
// columns, serialized into their flat (ScalarFlatEntity) shape. Anything unexpected
// on the entity instance is dropped, so a flat entity can never silently leak an
// unregistered property. Absent values are normalized to `null` so the output always
// has a stable key shape and never an `undefined` value.
export const fromEntityToScalarEntity = <T extends AllMetadataName>({
  metadataName,
  entity,
}: {
  metadataName: T;
  entity: EntityWithRegroupedOneToManyRelations<MetadataEntity<T>>;
}): ScalarFlatEntity<MetadataEntity<T>> => {
  const propertiesConfiguration =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];
  const entityRecord = entity as Record<string, unknown>;

  const scalarProperties: Record<string, unknown> = {};

  for (const propertyName of [
    ...BASE_SCALAR_PROPERTY_NAMES,
    ...Object.keys(propertiesConfiguration),
  ]) {
    scalarProperties[propertyName] = serializeScalarValue(
      entityRecord[propertyName],
    );
  }

  return scalarProperties as ScalarFlatEntity<MetadataEntity<T>>;
};
