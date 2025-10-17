import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { FlatEntityPropertyUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-property-update.type';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { isPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/is-property-update.util';

export const findFlatEntityPropertyUpdate = <
  T extends AllMetadataName,
  P extends Extract<
    FlatEntityPropertiesToCompare<T>,
    keyof MetadataFlatEntity<T>
  >,
>({
  property,
  flatEntityUpdates,
}: {
  flatEntityUpdates: FlatEntityPropertiesUpdates<T>;
  property: P;
}) =>
  flatEntityUpdates.find((update): update is FlatEntityPropertyUpdate<T, P> =>
    isPropertyUpdate(update, property),
  );
