import {
  type ConditionalDisplay,
  type UniversalConditionalDisplay,
} from 'twenty-shared/types';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { fromUniversalConditionalDisplayToConditionalDisplay } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-universal-conditional-display-to-conditional-display.util';

export const resolveUpdateConditionalDisplay = <
  TUpdate extends {
    universalConditionalDisplay?: UniversalConditionalDisplay | null;
  },
>({
  update,
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  update: TUpdate;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): Omit<TUpdate, 'universalConditionalDisplay'> & {
  conditionalDisplay?: ConditionalDisplay | null;
} => {
  const { universalConditionalDisplay, ...otherUpdate } = update;

  if (universalConditionalDisplay === undefined) {
    return otherUpdate;
  }

  const conditionalDisplay =
    fromUniversalConditionalDisplayToConditionalDisplay({
      universalConditionalDisplay,
      flatFieldMetadataMaps,
      flatRoleMaps,
    });

  return { ...otherUpdate, conditionalDisplay };
};
