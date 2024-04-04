import 'reflect-metadata';

import {
  ReflectRelationMetadata,
  RelationMetadataDecoratorParams,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-relation-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';

export function RelationMetadata<TClass extends object>(
  params: RelationMetadataDecoratorParams<TClass>,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const relationMetadataCollection =
      TypedReflect.getMetadata(
        'reflectRelationMetadataCollection',
        target.constructor,
      ) ?? [];
    const gate = TypedReflect.getMetadata('gate', target, fieldKey);

    TypedReflect.defineMetadata(
      'reflectRelationMetadataCollection',
      [
        ...relationMetadataCollection,
        {
          target,
          fieldKey,
          ...params,
          gate,
        } satisfies ReflectRelationMetadata,
      ],
      target.constructor,
    );
  };
}
