import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIndex(): PropertyDecorator;
export function WorkspaceIndex(columns: string[]): ClassDecorator;
export function WorkspaceIndex(indexType: IndexType): PropertyDecorator;
export function WorkspaceIndex(
  columnsOrIndexType?: string[] | IndexType,
): PropertyDecorator | ClassDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (propertyKey === undefined && columnsOrIndexType === undefined) {
      throw new Error('Class level WorkspaceIndex should be used with columns');
    }

    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
      propertyKey.toString(),
    );

    // TODO: handle composite field metadata types
    if (Array.isArray(columnsOrIndexType)) {
      const columns = columnsOrIndexType;

      if (columns.length > 0) {
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
    }

    const indexType = columnsOrIndexType as IndexType;

    metadataArgsStorage.addIndexes({
      name: `IDX_${generateDeterministicIndexName([
        convertClassNameToObjectMetadataName(target.constructor.name),
        ...[propertyKey.toString()],
      ])}`,
      columns: [propertyKey.toString()],
      target: target.constructor,
      type: indexType,
      gate,
    });
  };
}
