import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name.type';
import { type PrivatableEntity } from 'src/engine/permissions/metadata-permissions/types/privatable-entity.type';

export type PrivatableMetadataName = {
  [
    TMetadataName in keyof AllFlatEntityTypesByMetadataName
  ]: AllFlatEntityTypesByMetadataName[TMetadataName]['flatEntity'] extends PrivatableEntity
    ? TMetadataName
    : never;
}[keyof AllFlatEntityTypesByMetadataName];
