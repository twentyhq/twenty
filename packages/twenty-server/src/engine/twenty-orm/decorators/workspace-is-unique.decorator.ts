import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsUnique(): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string | symbol) => {
    if (propertyKey === undefined) {
      throw new Error('This decorator should be used with a field not a class');
    }

    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
      propertyKey.toString(),
    );

    const columns = [propertyKey.toString()];

    metadataArgsStorage.addIndexes({
      name: generateDeterministicIndexNameV2({
        flatObjectMetadata: {
          nameSingular: convertClassNameToObjectMetadataName(
            target.constructor.name,
          ),
          isCustom: false,
        },
        relatedFieldNames: columns.map((column) => ({
          name: column,
        })),
        isUnique: true,
      }),
      columns,
      target: target.constructor,
      gate,
      isUnique: true,
      whereClause: null,
    });

    return TypedReflect.defineMetadata(
      'workspace:is-unique-metadata-args',
      true,
      target,
      propertyKey.toString(),
    );
  };
}
