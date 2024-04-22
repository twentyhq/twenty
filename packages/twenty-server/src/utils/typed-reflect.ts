import 'reflect-metadata';

import { GateDecoratorParams } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/gate-decorator.interface';
import { ReflectBaseCustomObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-custom-object-metadata.interface';
import { ReflectDynamicRelationFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-computed-relation-field-metadata.interface';
import { ReflectFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';
import { ReflectObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-object-metadata.interface';
import { ReflectRelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-relation-metadata.interface';

export interface ReflectMetadataTypeMap {
  objectMetadata: ReflectObjectMetadata;
  extendObjectMetadata: ReflectBaseCustomObjectMetadata;
  fieldMetadataMap: ReflectFieldMetadata;
  dynamicRelationFieldMetadataMap: ReflectDynamicRelationFieldMetadata;
  reflectRelationMetadataCollection: ReflectRelationMetadata[];
  gate: GateDecoratorParams;
  isNullable: true;
  isSystem: true;
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
