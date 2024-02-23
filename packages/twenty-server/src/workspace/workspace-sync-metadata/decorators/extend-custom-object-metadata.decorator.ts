import { ExtendCustomObjectMetadataDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-custom-object-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';

export function ExtendCustomObjectMetadata(
  params?: ExtendCustomObjectMetadataDecoratorParams,
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
