import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceCustomEntity(): ClassDecorator {
  return (target) => {
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
    );

    metadataArgsStorage.addExtendedEntities({
      target,
      gate,
    });
  };
}
