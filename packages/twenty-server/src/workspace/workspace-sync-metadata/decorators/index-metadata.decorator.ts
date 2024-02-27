import { IndexDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/index-decorator.interface';
import { ReflectIndexMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-index-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';

export function IndexMetadata(metadata: IndexDecoratorParams): ClassDecorator {
  return (target) => {
    const existingIndexMetadata =
      TypedReflect.getMetadata('indexMetadataCollection', target) ?? [];

    TypedReflect.defineMetadata(
      'indexMetadataCollection',
      [
        ...existingIndexMetadata,
        {
          ...metadata,
        } satisfies ReflectIndexMetadata,
      ],
      target,
    );
  };
}
