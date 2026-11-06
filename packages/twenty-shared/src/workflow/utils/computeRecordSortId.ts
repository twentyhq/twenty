import { v5 } from 'uuid';

import { RECORD_SORT_ID_NAMESPACE } from '@/workflow/constants/RecordSortIdNamespace';

// Deterministic so every copy of a step (core and workspace versions, runs, manifests) gets the same sort ids
export const computeRecordSortId = ({
  stepId,
  index,
}: {
  stepId: string;
  index: number;
}): string => v5(`${stepId}:${index}`, RECORD_SORT_ID_NAMESPACE);
