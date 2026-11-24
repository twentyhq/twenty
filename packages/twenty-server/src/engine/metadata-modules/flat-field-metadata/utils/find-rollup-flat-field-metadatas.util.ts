import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const findRollupFlatFieldMetadatas = <
  TFlatFieldMetadata extends Pick<OrmFlatFieldMetadata, 'type'>,
>(flatFieldMetadataMaps: {
  byUniversalIdentifier: Partial<Record<string, TFlatFieldMetadata>>;
}) =>
  Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (
        flatFieldMetadata,
      ): flatFieldMetadata is TFlatFieldMetadata &
        FlatFieldMetadata<FieldMetadataType.ROLLUP> =>
        isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.ROLLUP),
    );
