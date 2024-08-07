import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

interface WorkspaceCustomEntityOptions {
  softDelete?: boolean;
}

export function WorkspaceCustomObject(
  options: WorkspaceCustomEntityOptions = {},
): ClassDecorator {
  return (target) => {
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
    );

    metadataArgsStorage.addExtendedEntities({
      target,
      gate,
      softDelete: options.softDelete,
    });
  };
}
