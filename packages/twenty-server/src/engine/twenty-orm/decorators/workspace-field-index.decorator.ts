import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { type WorkspaceIndexOptions } from 'src/engine/twenty-orm/decorators/workspace-index.decorator';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { getColumnsForIndex } from 'src/engine/twenty-orm/utils/get-default-columns-for-index.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { createDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceFieldIndex(
  options?: WorkspaceIndexOptions,
): PropertyDecorator {
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

    const additionalDefaultColumnsForIndex = getColumnsForIndex(
      options?.indexType,
    );

    const columns = [
      propertyKey.toString(),
      ...additionalDefaultColumnsForIndex,
    ];

    const indexName = `IDX_${generateDeterministicIndexName([
      convertClassNameToObjectMetadataName(target.constructor.name),
      ...columns,
    ])}`;
    metadataArgsStorage.addIndexes({
      name: indexName,
      columns,
      target: target.constructor,
      gate,
      isUnique: options?.isUnique ?? false,
      whereClause: options?.indexWhereClause ?? null,
      type: options?.indexType,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      universalIdentifier: createDeterministicUuid(indexName),
    });
  };
}
