export const claimUniqueSuffixedLabel = ({
  baseLabel,
  startOrdinal,
  takenLabels,
  formatOrdinal,
}: {
  baseLabel: string;
  startOrdinal: number;
  takenLabels: Set<string>;
  formatOrdinal: (ordinal: number) => string;
}): { label: string; nextOrdinal: number } => {
  let ordinal = startOrdinal;
  let candidateLabel = `${baseLabel} (${formatOrdinal(ordinal)})`;

  while (takenLabels.has(candidateLabel)) {
    ordinal += 1;
    candidateLabel = `${baseLabel} (${formatOrdinal(ordinal)})`;
  }

  takenLabels.add(candidateLabel);

  return { label: candidateLabel, nextOrdinal: ordinal + 1 };
};
