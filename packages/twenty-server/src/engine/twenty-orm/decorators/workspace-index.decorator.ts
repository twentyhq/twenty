import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

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

    // TODO: handle composite field metadata types
    // TODO: handle relation field metadata types

    const computedColumns = columns ?? [propertyKey.toString()];

    metadataArgsStorage.addIndexes({
      name: `IDX_${generateDeterministicIndexName(computedColumns)}`,
      columns: computedColumns,
      target: target.constructor,
    });
  };
}
