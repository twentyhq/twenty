export const getFormattedReleaseNumber = (versionNumber: string) => {
  const formattedVersion = versionNumber.replace(/^v/i, '');

  const parts = formattedVersion.split('.').map(Number);

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error('Version must be in the format major.minor.patch');
  }

  const majorWeight = 10000;
  const minorWeight = 100;
  const patchWeight = 1;

  const numericVersion =
    parts[0] * majorWeight + parts[1] * minorWeight + parts[2] * patchWeight;

  return numericVersion;
};
