import { type IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any) => {
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
    );

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
        isUnique: options?.isUnique ?? false,
      }),
      columns,
      target: target,
      gate,
      isUnique: options?.isUnique ?? false,
      whereClause: options?.indexWhereClause ?? null,
      type: options?.indexType,
    });
  };
}
