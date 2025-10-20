import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type MetadataWorkspaceMigrationActionsRecord<T extends AllMetadataName> =
  {
    [K in 'created' | 'updated' | 'deleted']: MetadataWorkspaceMigrationAction<
      T,
      K
    >[];
  };

export type MetadataWorkspaceMigrationAction<
  T extends AllMetadataName,
  TOperation extends 'created' | 'deleted' | 'updated' =
    | 'created'
    | 'deleted'
    | 'updated',
> = AllFlatEntityTypesByMetadataName[T]['actions'][TOperation] extends infer Action
  ? Action extends Array<unknown>
    ? Action[number]
    : Action
  : never;

export type FromWorkspaceMigrationActionToMetadataName<TAction> = {
  [K in AllMetadataName]: TAction extends AllFlatEntityTypesByMetadataName[K]['actions'][
    | 'created'
    | 'deleted'
    | 'updated']
    ? K
    : never;
}[AllMetadataName];
