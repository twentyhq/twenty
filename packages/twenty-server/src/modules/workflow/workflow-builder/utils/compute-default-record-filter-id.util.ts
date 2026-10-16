import { v5 } from 'uuid';

const DEFAULT_RECORD_FILTER_ID_NAMESPACE =
  'ea9a0f4f-8d23-4716-8287-93371a60e360';

export const computeDefaultRecordFilterId = ({
  stepId,
  recordFilterIndex,
}: {
  stepId: string;
  recordFilterIndex: number;
}): string =>
  v5(`${stepId}:${recordFilterIndex}`, DEFAULT_RECORD_FILTER_ID_NAMESPACE);
