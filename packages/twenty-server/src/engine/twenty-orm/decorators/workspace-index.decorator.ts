import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

export interface WorkspaceIndexOptions {
  name: string;
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

    if (Array.isArray(columns) && columns.length > 0) {
      metadataArgsStorage.addIndexes({
        name: `idx_${columns.join('_')}`,
        columns,
        target: target,
      });

      return;
    }

    metadataArgsStorage.addIndexes({
      name: `idx_${propertyKey.toString()}`,
      columns: [propertyKey.toString()],
      target: target.constructor,
    });
  };
}
