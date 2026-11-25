import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

type UuidPropertyName<TFlatEntity> = {
  [TPropertyName in keyof TFlatEntity]: TFlatEntity[TPropertyName] extends
    | string
    | null
    ? TPropertyName
    : never;
}[keyof TFlatEntity];

export const findFlatEntityByUuidPropertyInFlatEntityMaps = <
  TFlatEntity extends SyncableFlatEntity,
>({
  flatEntityMaps,
  propertyName,
  uuid,
}: {
  flatEntityMaps: Pick<FlatEntityMaps<TFlatEntity>, 'byUniversalIdentifier'>;
  propertyName: UuidPropertyName<TFlatEntity>;
  uuid: string;
}): TFlatEntity | undefined => {
  const lowercasedUuid = uuid.toLowerCase();

  return Object.values(flatEntityMaps.byUniversalIdentifier)
    .filter(isDefined)
    .find((flatEntity) => flatEntity[propertyName] === lowercasedUuid);
};
