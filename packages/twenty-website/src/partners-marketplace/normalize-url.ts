export const normalizeUrl = (raw: string | null | undefined): string => {
  if (!raw) {
    return '';
  }

  return raw.includes('://') ? raw : `https://${raw}`;
};
