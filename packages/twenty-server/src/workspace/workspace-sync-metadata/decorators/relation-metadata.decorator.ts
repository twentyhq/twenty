import 'reflect-metadata';

import { RelationMetadataDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-relation-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';
import { convertClassNameToObjectMetadataName } from 'src/workspace/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

export function RelationMetadata(
  params: RelationMetadataDecoratorParams,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const existingRelationMetadata =
      TypedReflect.getMetadata('relationMetadata', target.constructor) ?? [];
    const gate = TypedReflect.getMetadata('gate', target, fieldKey);
    const objectName = convertClassNameToObjectMetadataName(
      target.constructor.name,
    );

    Reflect.defineMetadata(
      'relationMetadata',
      [
        ...existingRelationMetadata,
        {
          type: params.type,
          fromObjectNameSingular: objectName,
          toObjectNameSingular: params.objectName,
          fromFieldMetadataName: fieldKey,
          toFieldMetadataName: params.inverseSideFieldName ?? objectName,
          gate,
        },
      ],
      target.constructor,
    );
  };
}
