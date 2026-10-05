import { type ApplicationVariableFileValue } from '@/application/applicationVariablesType';
import { isNonEmptyString } from '@/utils/typeguard/isNonEmptyString';
import { isDefined } from '@/utils/validation/isDefined';

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === 'string';

export const isApplicationVariableFileValue = (
  value: unknown,
): value is ApplicationVariableFileValue =>
  isDefined(value) &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  'fileId' in value &&
  isNonEmptyString(value.fileId) &&
  'label' in value &&
  typeof value.label === 'string' &&
  isOptionalString('extension' in value ? value.extension : undefined) &&
  isOptionalString('url' in value ? value.url : undefined);

// Urls are minted on every read, so only the identity of a file is stored
export const toStoredApplicationVariableFileValue = ({
  fileId,
  label,
  extension,
}: ApplicationVariableFileValue): ApplicationVariableFileValue => ({
  fileId,
  label,
  ...(isNonEmptyString(extension) ? { extension } : {}),
});

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
