import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getChartLabelIdentifierField } from 'src/modules/dashboard/chart-data/utils/get-chart-label-identifier-field.util';

const hasNonEmptyLabelIdentifierValue = (
  record: Record<string, unknown>,
  labelIdentifierField: FlatFieldMetadata,
): boolean => {
  const fieldValue = record[labelIdentifierField.name];

  if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
    const nameValue = fieldValue as
      | { firstName?: string; lastName?: string }
      | undefined;

    return isNonEmptyString(
      `${nameValue?.firstName ?? ''} ${nameValue?.lastName ?? ''}`.trim(),
    );
  }

  return isDefined(fieldValue) && isNonEmptyString(String(fieldValue).trim());
};

export const buildRawLabelByRecordId = ({
  records,
  targetFlatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  records: Record<string, unknown>[];
  targetFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Map<string, string> => {
  const rawLabelByRecordId = new Map<string, string>();

  const labelIdentifierField = getChartLabelIdentifierField({
    flatObjectMetadata: targetFlatObjectMetadata,
    flatFieldMetadataMaps,
  });

  if (!isDefined(labelIdentifierField)) {
    return rawLabelByRecordId;
  }

  for (const record of records) {
    if (!hasNonEmptyLabelIdentifierValue(record, labelIdentifierField)) {
      continue;
    }

    rawLabelByRecordId.set(
      String(record.id),
      getRecordDisplayName(
        record,
        targetFlatObjectMetadata,
        flatFieldMetadataMaps,
      ),
    );
  }

  return rawLabelByRecordId;
};
