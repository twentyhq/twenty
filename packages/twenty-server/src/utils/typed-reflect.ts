import 'reflect-metadata';

import { Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

export interface ReflectMetadataTypeMap {
  ['workspace:is-nullable-metadata-args']: true;
  ['workspace:gate-metadata-args']: Gate;
  ['workspace:is-system-metadata-args']: true;
  ['workspace:is-audit-logged-metadata-args']: false;
  ['workspace:is-primary-field-metadata-args']: true;
  ['workspace:is-deprecated-field-metadata-args']: true;
  ['workspace:is-unique-metadata-args']: true;
}

export class TypedReflect {
  static defineMetadata<T extends keyof ReflectMetadataTypeMap>(
    metadataKey: T,
    metadataValue: ReflectMetadataTypeMap[T],
    target: object,
  ): void;

  static defineMetadata<T extends keyof ReflectMetadataTypeMap>(
    metadataKey: T,
    metadataValue: ReflectMetadataTypeMap[T],
    target: object,
    propertyKey: string,
  ): void;

  static defineMetadata<T extends keyof ReflectMetadataTypeMap>(
    metadataKey: T,
    metadataValue: ReflectMetadataTypeMap[T],
    target: object,
    propertyKeyOrUndefined?: string,
  ) {
    if (propertyKeyOrUndefined === undefined) {
      Reflect.defineMetadata(metadataKey, metadataValue, target);
    } else {
      Reflect.defineMetadata(
        metadataKey,
        metadataValue,
        target,
        propertyKeyOrUndefined,
      );
    }
  }

  static getMetadata<T extends keyof ReflectMetadataTypeMap>(
    metadataKey: T,
    target: object,
  ): ReflectMetadataTypeMap[T] | undefined;

  static getMetadata<T extends keyof ReflectMetadataTypeMap>(
    metadataKey: T,
    target: object,
    propertyKey: string,
  ): ReflectMetadataTypeMap[T] | undefined;

  static getMetadata<T extends keyof ReflectMetadataTypeMap>(
    metadataKey: T,
    target: object,
    propertyKeyOrUndefined?: string,
  ) {
    if (propertyKeyOrUndefined === undefined) {
      return Reflect.getMetadata(metadataKey, target);
    } else {
      return Reflect.getMetadata(metadataKey, target, propertyKeyOrUndefined);
    }
  }
}
