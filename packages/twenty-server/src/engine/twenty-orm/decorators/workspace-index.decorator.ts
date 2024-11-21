import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { TypedReflect } from 'src/utils/typed-reflect';

export type WorkspaceIndexOptions = {
  isUnique?: boolean;
  indexWhereClause?: string;
  indexType?: IndexType;
};

export function WorkspaceIndex(
  columns: string[],
  options: WorkspaceIndexOptions,
): ClassDecorator {
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('Class level WorkspaceIndex should be used with columns');
  }

  return (target: any) => {
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
    );

    metadataArgsStorage.addIndexes({
      name: `IDX_${
        options?.isUnique ? 'UNIQUE_' : ''
      }${generateDeterministicIndexName([
        convertClassNameToObjectMetadataName(target.name),
        ...columns,
      ])}`,
      columns,
      target: target,
      gate,
      isUnique: options?.isUnique ?? false,
      whereClause: options?.indexWhereClause ?? null,
      type: options?.indexType,
    });
  };
}
