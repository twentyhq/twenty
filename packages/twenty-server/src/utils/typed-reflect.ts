import 'reflect-metadata';

import { type Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

import { type WorkspaceEntityDuplicateCriteria } from 'src/engine/api/graphql/workspace-query-builder/types/workspace-entity-duplicate-criteria.type';
import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';

export interface ReflectMetadataTypeMap {
  ['workspace:is-nullable-metadata-args']: true;
  ['workspace:gate-metadata-args']: Gate;
  ['workspace:is-system-metadata-args']: true;
  ['workspace:is-field-ui-readonly-metadata-args']: true;
  ['workspace:is-object-ui-readonly-metadata-args']: true;
  ['workspace:is-audit-logged-metadata-args']: false;
  ['workspace:is-primary-field-metadata-args']: true;
  ['workspace:is-deprecated-field-metadata-args']: true;
  ['workspace:is-unique-metadata-args']: true;
  ['workspace:duplicate-criteria-metadata-args']: WorkspaceEntityDuplicateCriteria[];
  ['config-variables']: ConfigVariablesMetadataMap;
  ['workspace:is-searchable-metadata-args']: boolean;
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
