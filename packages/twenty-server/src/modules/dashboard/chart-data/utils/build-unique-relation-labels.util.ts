import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';

const claimSuffixedLabel = (
  baseLabel: string,
  startOrdinal: number,
  takenLabels: Set<string>,
  formatOrdinal: (ordinal: number) => string,
): { label: string; nextOrdinal: number } => {
  let ordinal = startOrdinal;
  let candidate = `${baseLabel} (${formatOrdinal(ordinal)})`;

  while (takenLabels.has(candidate)) {
    ordinal += 1;
    candidate = `${baseLabel} (${formatOrdinal(ordinal)})`;
  }

  takenLabels.add(candidate);

  return { label: candidate, nextOrdinal: ordinal + 1 };
};

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
    const isColliding = recordIds.length > 1 || takenLabels.has(rawLabel);

    if (!isColliding) {
      takenLabels.add(rawLabel);
      labelByRecordId.set(recordIds[0], rawLabel);
      continue;
    }

    let ordinal = 1;

    for (const recordId of recordIds) {
      const { label, nextOrdinal } = claimSuffixedLabel(
        rawLabel,
        ordinal,
        takenLabels,
        String,
      );

      labelByRecordId.set(recordId, label);
      ordinal = nextOrdinal;
    }
  }

  const sortedUnresolvedRecordIds = [...unresolvedRecordIds].sort();

  if (sortedUnresolvedRecordIds.length === 1) {
    labelByRecordId.set(sortedUnresolvedRecordIds[0], t`Unknown`);
  } else if (sortedUnresolvedRecordIds.length > 1) {
    const padding = String(sortedUnresolvedRecordIds.length).length;
    let ordinal = 1;

    for (const recordId of sortedUnresolvedRecordIds) {
      const { label, nextOrdinal } = claimSuffixedLabel(
        t`Unknown`,
        ordinal,
        takenLabels,
        (value) => String(value).padStart(padding, '0'),
      );

      labelByRecordId.set(recordId, label);
      ordinal = nextOrdinal;
    }
  }

  return { labelByRecordId, unresolvedRecordIds };
};
