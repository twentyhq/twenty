import { type ApplicationVariableFileValue } from '@/application/applicationVariablesType';
import { isDefined } from '@/utils/validation/isDefined';

export const isApplicationVariableFileValue = (
  value: unknown,
): value is ApplicationVariableFileValue =>
  isDefined(value) &&
  typeof value === 'object' &&
  'fileId' in value &&
  typeof value.fileId === 'string' &&
  'label' in value &&
  typeof value.label === 'string';

// A FILES variable is stored as a JSON list of file references; anything
// that is not such a list reads as no file at all.
export const parseApplicationVariableFilesValue = (
  serializedValue: string,
): ApplicationVariableFileValue[] => {
  if (serializedValue === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(serializedValue) as unknown;

    return Array.isArray(parsed)
      ? parsed.filter(isApplicationVariableFileValue)
      : [];
  } catch {
    return [];
  }
};
