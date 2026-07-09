export const getAppSlug = (
  sourcePackage: string | undefined,
  universalIdentifier: string,
): string => {
  if (sourcePackage === undefined || sourcePackage.length === 0) {
    return universalIdentifier;
  }

  const lastSegment = sourcePackage.split('/').pop();

  return lastSegment !== undefined && lastSegment.length > 0
    ? lastSegment
    : universalIdentifier;
};
