import { BaseCustomObjectMetadataDecoratorParams } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-custom-object-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';

export const BaseCustomObjectMetadata =
  (params?: BaseCustomObjectMetadataDecoratorParams): ClassDecorator =>
  (target) => {
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
