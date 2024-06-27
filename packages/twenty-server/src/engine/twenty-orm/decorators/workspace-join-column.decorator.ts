import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

export function WorkspaceJoinColumn(
  relationPropertyKey: string,
): PropertyDecorator {
  return (object, propertyKey) => {
    metadataArgsStorage.addJoinColumns({
      target: object.constructor,
      relationName: relationPropertyKey,
      joinColumn: propertyKey.toString(),
    });
  };
}
