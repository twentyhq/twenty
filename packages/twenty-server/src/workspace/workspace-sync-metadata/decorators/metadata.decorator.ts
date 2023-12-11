import camelCase from 'lodash.camelcase';
import 'reflect-metadata';

import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { generateDefaultValue } from 'src/metadata/field-metadata/utils/generate-default-value';

export interface FieldMetadataDecorator<T extends FieldMetadataType> {
  type: T;
  label: string;
  description?: string | null;
  icon?: string | null;
  defaultValue?: FieldMetadataDefaultValue<T> | null;
  joinColumn?: string;
}

export type ObjectMetadataDecorator = {
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string | null;
  icon?: string | null;
};

export type RelationMetadataDecorator = {
  type: RelationMetadataType;
  objectName: string;
  inverseSideFieldName?: string;
};

function convertClassNameToObjectMetadataName(name: string): string {
  const classSuffix = 'ObjectMetadata';
  let objectName = camelCase(name);

  if (objectName.endsWith(classSuffix)) {
    objectName = objectName.slice(0, -classSuffix.length);
  }

  return objectName;
}

export function ObjectMetadata(
  metadata: ObjectMetadataDecorator,
): ClassDecorator {
  return (target) => {
    const isSystem = Reflect.getMetadata('isSystem', target) || false;

    const objectName = convertClassNameToObjectMetadataName(target.name);

    Reflect.defineMetadata(
      'objectMetadata',
      {
        nameSingular: objectName,
        ...metadata,
        targetTableName: objectName,
        isSystem,
        isCustom: false,
        description: metadata.description ?? null,
        icon: metadata.icon ?? null,
      },
      target,
    );
  };
}

export function IsNullable() {
  return function (target: object, fieldKey: string) {
    Reflect.defineMetadata('isNullable', true, target, fieldKey);
  };
}

export function IsSystem() {
  return function (target: object, fieldKey?: string) {
    if (fieldKey) {
      Reflect.defineMetadata('isSystem', true, target, fieldKey);
    } else {
      Reflect.defineMetadata('isSystem', true, target);
    }
  };
}

export function FieldMetadata<T extends FieldMetadataType>(
  metadata: FieldMetadataDecorator<T>,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const existingFieldMetadata =
      Reflect.getMetadata('fieldMetadata', target.constructor) || {};

    const isNullable =
      Reflect.getMetadata('isNullable', target, fieldKey) || false;

    const isSystem = Reflect.getMetadata('isSystem', target, fieldKey) || false;

    const { joinColumn, ...fieldMetadata } = metadata;

    Reflect.defineMetadata(
      'fieldMetadata',
      {
        ...existingFieldMetadata,
        [fieldKey]: generateFieldMetadata<T>(
          fieldMetadata,
          fieldKey,
          isNullable,
          isSystem,
        ),
        ...(joinColumn && fieldMetadata.type === FieldMetadataType.RELATION
          ? {
              [joinColumn]: generateFieldMetadata<FieldMetadataType.UUID>(
                {
                  ...fieldMetadata,
                  type: FieldMetadataType.UUID,
                  label: `${fieldMetadata.label} id (foreign key)`,
                  description: `${fieldMetadata.description} id foreign key`,
                  defaultValue: null,
                },
                joinColumn,
                isNullable,
                true,
              ),
            }
          : {}),
      },
      target.constructor,
    );
  };
}

function generateFieldMetadata<T extends FieldMetadataType>(
  metadata: FieldMetadataDecorator<T>,
  fieldKey: string,
  isNullable: boolean,
  isSystem: boolean,
) {
  const targetColumnMap = JSON.stringify(
    generateTargetColumnMap(metadata.type, false, fieldKey),
  );
  const defaultValue =
    metadata.defaultValue ?? generateDefaultValue(metadata.type);

  return {
    name: fieldKey,
    ...metadata,
    targetColumnMap: targetColumnMap,
    isNullable: metadata.type === FieldMetadataType.RELATION ? true : isNullable,
    isSystem,
    isCustom: false,
    options: null, // TODO: handle options + stringify for the diff.
    description: metadata.description ?? null,
    icon: metadata.icon ?? null,
    defaultValue: defaultValue ? JSON.stringify(defaultValue) : null,
  };
}

export function RelationMetadata(
  metadata: RelationMetadataDecorator,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const existingRelationMetadata =
      Reflect.getMetadata('relationMetadata', target.constructor) || [];

    const objectName = convertClassNameToObjectMetadataName(
      target.constructor.name,
    );

    Reflect.defineMetadata(
      'relationMetadata',
      [
        ...existingRelationMetadata,
        {
          type: metadata.type,
          fromObjectNameSingular: objectName,
          toObjectNameSingular: metadata.objectName,
          fromFieldMetadataName: fieldKey,
          toFieldMetadataName: metadata.inverseSideFieldName ?? objectName,
        },
      ],
      target.constructor,
    );
  };
}
