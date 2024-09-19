import { generateDeterministicIndexName } from "src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name";
import { WorkspaceIndexOptions } from "src/engine/twenty-orm/decorators/workspace-index.decorator";
import { metadataArgsStorage } from "src/engine/twenty-orm/storage/metadata-args.storage";
import { convertClassNameToObjectMetadataName } from "src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util";
import { TypedReflect } from "src/utils/typed-reflect";

export function WorkspaceColumnIndex(options?: WorkspaceIndexOptions): PropertyDecorator {

    return (target: any, propertyKey: string | symbol) => {
      if (propertyKey === undefined) {
        throw new Error('This decorator should be used with a field not a class');
      }
  
      const gate = TypedReflect.getMetadata(
        'workspace:gate-metadata-args',
        target,
        propertyKey.toString(),
      );
  
      // TODO: handle composite field metadata types
  
      metadataArgsStorage.addIndexes({
        name: `IDX_${generateDeterministicIndexName([
          convertClassNameToObjectMetadataName(target.constructor.name),
          ...[propertyKey.toString(), 'deletedAt'],
        ])}`,
        columns: [propertyKey.toString(), 'deletedAt'],
        target: target.constructor,
        gate,
        isUnique:options?.isUnique ?? false,
      });
    };
  }