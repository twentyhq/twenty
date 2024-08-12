import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface WorkspaceIndexOptions {
  columns?: string[];
}

export function WorkspaceIndex(): PropertyDecorator;
export function WorkspaceIndex(columns: string[]): ClassDecorator;
export function WorkspaceIndex(
  columns?: string[],
): PropertyDecorator | ClassDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (propertyKey === undefined && columns === undefined) {
      throw new Error('Class level WorkspaceIndex should be used with columns');
    }

    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
      propertyKey.toString(),
    );

    // TODO: handle composite field metadata types

    if (Array.isArray(columns) && columns.length > 0) {
      metadataArgsStorage.addIndexes({
        name: `IDX_${generateDeterministicIndexName([
          convertClassNameToObjectMetadataName(target.name),
          ...columns,
        ])}`,
        columns,
        target: target,
        gate,
      });

      return;
    }

    metadataArgsStorage.addIndexes({
      name: `IDX_${generateDeterministicIndexName([
        convertClassNameToObjectMetadataName(target.constructor.name),
        propertyKey.toString(),
      ])}`,
      columns: [propertyKey.toString()],
      target: target.constructor,
      gate,
    });
  };
}
