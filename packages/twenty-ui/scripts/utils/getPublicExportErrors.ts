import { isDefined } from '../../src/utilities/utils/isDefined';
import { type PublicExportInventory } from '../types/PublicExportInventory';

export const getPublicExportErrors = ({
  actual,
  expected,
}: {
  actual: PublicExportInventory;
  expected: PublicExportInventory;
}): string[] => {
  const errors: string[] = [];

  for (const entryPoint of new Set([
    ...Object.keys(actual),
    ...Object.keys(expected),
  ])) {
    const actualEntry = actual[entryPoint];
    const expectedEntry = expected[entryPoint];

    if (!isDefined(actualEntry) || !isDefined(expectedEntry)) {
      errors.push(`${entryPoint} has no matching public entry point decision`);
      continue;
    }

    if (
      JSON.stringify(actualEntry.reExports) !==
      JSON.stringify(expectedEntry.reExports)
    ) {
      errors.push(`${entryPoint} has changed aggregate exports`);
    }

    for (const kind of ['values', 'types'] as const) {
      for (const name of new Set([
        ...Object.keys(actualEntry[kind]),
        ...Object.keys(expectedEntry[kind]),
      ])) {
        if (actualEntry[kind][name] !== expectedEntry[kind][name]) {
          errors.push(
            `${entryPoint} ${kind}: ${name} has no matching public export decision`,
          );
        }
      }
    }
  }

  return errors;
};
