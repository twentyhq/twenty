import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';

export const stripSecretFromApplicationVariables = (
  flatApplicationVariables: FlatApplicationVariable[],
): Record<string, string> => {
  return flatApplicationVariables.reduce<Record<string, string>>(
    (acc, flatApplicationVariable) => {
      if (flatApplicationVariable.isSecret) {
        return acc;
      }

      acc[flatApplicationVariable.key] = String(
        flatApplicationVariable.value ?? '',
      );

      return acc;
    },
    {},
  );
};
