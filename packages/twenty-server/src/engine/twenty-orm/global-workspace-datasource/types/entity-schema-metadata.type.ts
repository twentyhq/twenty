import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type EntitySchemaObjectMetadata = Pick<
  ObjectMetadataEntity,
  'id' | 'nameSingular' | 'isCustom'
> & {
  fieldMetadataIds: string[];
};

export type EntitySchemaFieldMetadata<
  TFieldMetadataType extends FieldMetadataType = FieldMetadataType,
> = Pick<
  FieldMetadataEntity<TFieldMetadataType>,
  | 'id'
  | 'name'
  | 'type'
  | 'settings'
  | 'isNullable'
  | 'defaultValue'
  | 'options'
  | 'objectMetadataId'
  | 'relationTargetObjectMetadataId'
  | 'relationTargetFieldMetadataId'
>;

export type EntitySchemaObjectMetadataMaps = {
  byId: Partial<Record<string, EntitySchemaObjectMetadata>>;
};

export type EntitySchemaFieldMetadataMaps = {
  byId: Partial<Record<string, EntitySchemaFieldMetadata>>;
};

export const buildEntitySchemaMetadataMaps = (
  objectMetadatas: ObjectMetadataEntity[],
  fieldMetadatas: FieldMetadataEntity[],
): {
  objectMetadataMaps: EntitySchemaObjectMetadataMaps;
  fieldMetadataMaps: EntitySchemaFieldMetadataMaps;
} => {
  const fieldIdsByObjectId = new Map<string, string[]>();

  for (const field of fieldMetadatas) {
    const existing = fieldIdsByObjectId.get(field.objectMetadataId);

    if (existing) {
      existing.push(field.id);
    } else {
      fieldIdsByObjectId.set(field.objectMetadataId, [field.id]);
    }
  }

  const objectMetadataMaps: EntitySchemaObjectMetadataMaps = { byId: {} };

  for (const object of objectMetadatas) {
    objectMetadataMaps.byId[object.id] = {
      id: object.id,
      nameSingular: object.nameSingular,
      isCustom: object.isCustom,
      fieldMetadataIds: fieldIdsByObjectId.get(object.id) ?? [],
    };
  }

  const fieldMetadataMaps: EntitySchemaFieldMetadataMaps = { byId: {} };

  for (const field of fieldMetadatas) {
    fieldMetadataMaps.byId[field.id] = {
      id: field.id,
      name: field.name,
      type: field.type,
      settings: field.settings,
      isNullable: field.isNullable,
      defaultValue: field.defaultValue,
      options: field.options,
      objectMetadataId: field.objectMetadataId,
      relationTargetObjectMetadataId: field.relationTargetObjectMetadataId,
      relationTargetFieldMetadataId: field.relationTargetFieldMetadataId,
    };
  }

  return { objectMetadataMaps, fieldMetadataMaps };
};
