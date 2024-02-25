import 'reflect-metadata';

import {
  ReflectRelationMetadata,
  RelationMetadataDecoratorParams,
} from 'src/workspace/workspace-sync-metadata/interfaces/reflect-relation-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';
import { convertClassNameToObjectMetadataName } from 'src/workspace/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { RelationOnDeleteAction } from 'src/metadata/relation-metadata/relation-metadata.entity';

export function RelationMetadata(
  params: RelationMetadataDecoratorParams,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const relationMetadataCollection =
      TypedReflect.getMetadata(
        'relationMetadataCollection',
        target.constructor,
      ) ?? [];
    const gate = TypedReflect.getMetadata('gate', target, fieldKey);
    const objectName = convertClassNameToObjectMetadataName(
      target.constructor.name,
    );

    Reflect.defineMetadata(
      'relationMetadataCollection',
      [
        ...relationMetadataCollection,
        {
          type: params.type,
          fromObjectNameSingular: objectName,
          toObjectNameSingular: params.objectName,
          fromFieldMetadataName: fieldKey,
          toFieldMetadataName: params.inverseSideFieldName ?? objectName,
          onDelete: params.onDelete ?? RelationOnDeleteAction.SET_NULL,
          gate,
        } satisfies ReflectRelationMetadata,
      ],
      target.constructor,
    );
  };
}
