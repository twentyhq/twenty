import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { claimUniqueSuffixedLabel } from 'src/modules/dashboard/chart-data/utils/claim-unique-suffixed-label.util';

export const buildUniqueRelationLabels = ({
  rawLabelByRecordId,
  allRecordIds,
}: {
  rawLabelByRecordId: ReadonlyMap<string, string>;
  allRecordIds: string[];
}): RelationLabelResolution => {
  const sortedRecordIds = [...new Set(allRecordIds)].sort();
  const takenLabels = new Set<string>([t`Not Set`, t`Unknown`]);
  const labelByRecordId = new Map<string, string>();
  const unresolvedRecordIds = new Set<string>();
  const recordIdsByRawLabel = new Map<string, string[]>();

  for (const recordId of sortedRecordIds) {
    const rawLabel = rawLabelByRecordId.get(recordId);

    if (!isDefined(rawLabel) || !isNonEmptyString(rawLabel.trim())) {
      unresolvedRecordIds.add(recordId);
      continue;
    }

    const recordIdsWithSameLabel = recordIdsByRawLabel.get(rawLabel) ?? [];

    recordIdsWithSameLabel.push(recordId);
    recordIdsByRawLabel.set(rawLabel, recordIdsWithSameLabel);
  }

  for (const [rawLabel, recordIds] of recordIdsByRawLabel) {
    const isCollidingLabel = recordIds.length > 1 || takenLabels.has(rawLabel);

    if (!isCollidingLabel) {
      takenLabels.add(rawLabel);
      labelByRecordId.set(recordIds[0], rawLabel);
      continue;
    }

    let ordinal = 1;

    for (const recordId of recordIds) {
      const { label, nextOrdinal } = claimUniqueSuffixedLabel({
        baseLabel: rawLabel,
        startOrdinal: ordinal,
        takenLabels,
        formatOrdinal: String,
      });

      labelByRecordId.set(recordId, label);
      ordinal = nextOrdinal;
    }
  }

  return { labelByRecordId, unresolvedRecordIds };
};
