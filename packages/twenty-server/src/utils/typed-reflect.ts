import 'reflect-metadata';
import { type FeatureFlagKey } from 'twenty-shared/types';

import { type ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';

export interface ReflectMetadataTypeMap {
  ['config-variables']: ConfigVariablesMetadataMap;
  ['feature-flag-metadata-args']: FeatureFlagKey;
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
