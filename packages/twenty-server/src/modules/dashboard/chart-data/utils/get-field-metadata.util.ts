import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { resolveFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';

export const getFieldMetadata = (
  fieldMetadataId: string,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  flatFieldMetadataOptionMaps?: FlatFieldMetadataOptionMaps,
): FlatFieldMetadata => {
  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(fieldMetadata)) {
    throw new ChartDataException(
      generateChartDataExceptionMessage(
        ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
        fieldMetadataId,
      ),
      ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  return isDefined(flatFieldMetadataOptionMaps)
    ? {
        ...fieldMetadata,
        options: resolveFlatFieldMetadataOptions({
          flatFieldMetadata: fieldMetadata,
          flatFieldMetadataOptionMaps,
        }),
      }
    : fieldMetadata;
};
