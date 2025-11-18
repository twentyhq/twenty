import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

export function WorkspaceJoinColumn({
  relationPropertyKey,
  universalIdentifier,
}: {
  relationPropertyKey: string;
  universalIdentifier: string;
}): PropertyDecorator {
  return (object, propertyKey) => {
    metadataArgsStorage.addJoinColumns({
      target: object.constructor,
      relationName: relationPropertyKey,
      joinColumn: propertyKey.toString(),
    });

    // Register index for join column
    WorkspaceFieldIndex({
      universalIdentifier,
    })(object, propertyKey);
  };
}
