const LIGHT_SEED_RECORD_LIMIT = 5;

export const getRecordSeedsForMode = <T>(
  recordSeeds: T[],
  light: boolean,
): T[] => {
  return light ? recordSeeds.slice(0, LIGHT_SEED_RECORD_LIMIT) : recordSeeds;
};
