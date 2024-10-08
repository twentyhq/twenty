import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { getColumnsForIndex } from 'src/engine/twenty-orm/utils/get-default-columns-for-index.util';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsUnique(): PropertyDecorator {
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
      IndexType.BTREE,
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
      gate,
      isUnique: true,
      whereClause: '"deletedAt" IS NULL AND "domainNamePrimaryLinkUrl" != \'\'',
    });
  };
}
