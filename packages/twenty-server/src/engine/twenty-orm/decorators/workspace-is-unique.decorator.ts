import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { createDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
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
    const indexName = `IDX_${generateDeterministicIndexName([
      convertClassNameToObjectMetadataName(target.constructor.name),
      ...columns,
    ])}`;
    metadataArgsStorage.addIndexes({
      name: indexName,
      columns,
      target: target.constructor,
      gate,
      isUnique: true,
      whereClause: null,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      universalIdentifier: createDeterministicUuid(indexName),
    });

    return TypedReflect.defineMetadata(
      'workspace:is-unique-metadata-args',
      true,
      target,
      propertyKey.toString(),
    );
  };
}
