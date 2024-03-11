import { BaseCustomObjectMetadataDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-custom-object-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';

export function BaseCustomObjectMetadata(
  params?: BaseCustomObjectMetadataDecoratorParams,
): ClassDecorator {
  return (target) => {
    const gate = TypedReflect.getMetadata('gate', target);

    TypedReflect.defineMetadata(
      'extendObjectMetadata',
      {
        ...params,
        gate,
      },
      target,
    );
  };
}
