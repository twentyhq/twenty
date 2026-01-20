import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';

export const getFieldMetadata = (
  fieldMetadataId: string,
  fieldMetadataById: Partial<Record<string, FlatFieldMetadata>>,
): FlatFieldMetadata => {
  const fieldMetadata = fieldMetadataById[fieldMetadataId];

  if (!isDefined(fieldMetadata)) {
    throw new ChartDataException(
      generateChartDataExceptionMessage(
        ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
        fieldMetadataId,
      ),
      ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  return fieldMetadata;
};
