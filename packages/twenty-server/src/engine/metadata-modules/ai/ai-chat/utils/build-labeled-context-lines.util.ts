import { isDefined } from 'twenty-shared/utils';

export const buildLabeledContextLines = ({
  requiredFirstLine,
  optionalLines,
}: {
  requiredFirstLine: string;
  optionalLines: [string, string | number | null][];
}): string => {
  const lines = [requiredFirstLine];

  for (const [label, value] of optionalLines) {
    if (isDefined(value)) {
      lines.push(`${label}: ${value}`);
    }
  }

  return lines.join('\n');
};
