import { ObjectMetadataDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-object-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';
import { convertClassNameToObjectMetadataName } from 'src/workspace/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

export function ObjectMetadata(
  params: ObjectMetadataDecoratorParams,
): ClassDecorator {
  return (target) => {
    const isSystem = TypedReflect.getMetadata('isSystem', target) ?? false;
    const gate = TypedReflect.getMetadata('gate', target);
    const objectName = convertClassNameToObjectMetadataName(target.name);

    TypedReflect.defineMetadata(
      'objectMetadata',
      {
        nameSingular: objectName,
        ...params,
        targetTableName: objectName,
        isSystem,
        isCustom: false,
        description: params.description,
        icon: params.icon,
        gate,
      },
      target,
    );
  };
}
