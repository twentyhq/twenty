import camelCase from 'lodash.camelcase';
import 'reflect-metadata';

import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';

export type FieldMetadataDecorator = {
  type: FieldMetadataType;
  label: string;
  description?: string | null;
  icon?: string | null;
  defaultValue?: FieldMetadataDefaultValue | null;
};

export type ObjectMetadataDecorator = {
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string | null;
  icon?: string | null;
};

const classSuffix = 'ObjectMetadata';

export function ObjectMetadata(
  metadata: ObjectMetadataDecorator,
): ClassDecorator {
  return (target) => {
    const isSystem = Reflect.getMetadata('isSystem', target) || false;

    let objectName = camelCase(target.name);

    if (objectName.endsWith(classSuffix)) {
      objectName = objectName.slice(0, -classSuffix.length);
    }

    Reflect.defineMetadata(
      'objectMetadata',
      {
        nameSingular: objectName,
        ...metadata,
        targetTableName: objectName,
        isSystem,
        isCustom: false,
        isActive: true,
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

export function FieldMetadata(
  metadata: FieldMetadataDecorator,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const existingFieldMetadata =
      Reflect.getMetadata('fieldMetadata', target.constructor) || {};

    const isNullable =
      Reflect.getMetadata('isNullable', target, fieldKey) || false;

    const isSystem = Reflect.getMetadata('isSystem', target, fieldKey) || false;

    Reflect.defineMetadata(
      'fieldMetadata',
      {
        ...existingFieldMetadata,
        [fieldKey]: {
          name: fieldKey,
          ...metadata,
          targetColumnMap: generateTargetColumnMap(
            metadata.type,
            false,
            fieldKey,
          ),
          isNullable,
          isSystem,
          isCustom: false,
          isActive: true,
        },
      },
      target.constructor,
    );
  };
}
