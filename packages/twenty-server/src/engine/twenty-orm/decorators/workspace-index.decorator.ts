import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { getColumnsForIndex } from 'src/engine/twenty-orm/utils/get-default-columns-for-index.util';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { isDefined } from 'src/utils/is-defined';
import { TypedReflect } from 'src/utils/typed-reflect';

export type WorkspaceIndexMetadata = {
  columns?: string[];
  indexType?: IndexType;
};

export function WorkspaceIndex(
  metadata?: WorkspaceIndexMetadata,
): PropertyDecorator;
export function WorkspaceIndex(
  metadata: WorkspaceIndexMetadata,
): ClassDecorator;
export function WorkspaceIndex(
  metadata?: WorkspaceIndexMetadata,
): PropertyDecorator | ClassDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (propertyKey === undefined && metadata === undefined) {
      throw new Error('Class level WorkspaceIndex should be used with columns');
    }

    if (propertyKey !== undefined && metadata?.columns !== undefined) {
      throw new Error(
        'Property level WorkspaceIndex should not be used with columns',
      );
    }

    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
      propertyKey.toString(),
    );

    // TODO: handle composite field metadata types
    if (isDefined(metadata?.columns)) {
      const columns = metadata.columns;

      if (columns.length > 0) {
        metadataArgsStorage.addIndexes({
          name: `IDX_${generateDeterministicIndexName([
            convertClassNameToObjectMetadataName(target.name),
            ...columns,
          ])}`,
          columns,
          target: target,
          gate,
          ...(isDefined(metadata?.indexType)
            ? { type: metadata.indexType }
            : {}),
        });

        return;
      }
    }

    if (isDefined(propertyKey)) {
      const additionalDefaultColumnsForIndex = getColumnsForIndex(
        metadata?.indexType,
      );
      const columns = [
        propertyKey.toString(),
        ...additionalDefaultColumnsForIndex,
      ];

      metadataArgsStorage.addIndexes({
        name: `IDX_${generateDeterministicIndexName([
          convertClassNameToObjectMetadataName(target.constructor.name),
          ...columns,
        ])}`,
        columns,
        target: target.constructor,
        ...(isDefined(metadata?.indexType) ? { type: metadata.indexType } : {}),
        gate,
      });
    }
  };
}
