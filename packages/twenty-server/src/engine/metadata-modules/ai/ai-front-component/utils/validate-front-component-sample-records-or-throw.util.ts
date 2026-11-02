import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const validateFrontComponentSampleRecordsOrThrow = ({
  sampleRecords,
  selectedFields,
}: {
  sampleRecords: Record<string, unknown>[];
  selectedFields: string[];
}): void => {
  if (Buffer.byteLength(JSON.stringify(sampleRecords), 'utf8') > 100000) {
    throw new ApplicationException(
      doNotTranslate('Sample records exceed 100 KB.'),
      ApplicationExceptionCode.INVALID_INPUT,
      { userFriendlyMessage: msg`Sample records exceed 100 KB.` },
    );
  }
  if (
    sampleRecords.some((record) =>
      Object.keys(record).some(
        (key) => key !== 'id' && !selectedFields.includes(key),
      ),
    )
  ) {
    throw new ApplicationException(
      doNotTranslate(
        'Sample records must only contain selected fields and id.',
      ),
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`Sample records must only contain selected fields and id.`,
      },
    );
  }
};
