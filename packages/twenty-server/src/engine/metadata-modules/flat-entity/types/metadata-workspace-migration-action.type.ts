import { type AllFlatEntityConfigurationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-configuration-by-metadata-name.type';
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
> = AllFlatEntityConfigurationByMetadataName[T]['actions'][TOperation] extends infer Action
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Action extends any[]
    ? Action[number]
    : Action
  : never;

export type FromWorkspaceMigrationActionToMetadataName<TAction> = {
  [K in AllMetadataName]: TAction extends AllFlatEntityConfigurationByMetadataName[K]['actions'][
    | 'created'
    | 'deleted'
    | 'updated']
    ? K
    : never;
}[AllMetadataName];

