import { FRONT_COMPONENT_SHARED_DEPENDENCIES_BANNER_PREFIX } from '../constants/FrontComponentSharedDependenciesBannerPrefix';

export const readFrontComponentSharedDependenciesChecksum = (
  source: string,
): string | undefined => {
  const firstLine = source.split('\n', 1)[0];

  if (
    !firstLine?.startsWith(FRONT_COMPONENT_SHARED_DEPENDENCIES_BANNER_PREFIX)
  ) {
    return undefined;
  }
  const checksum = firstLine.slice(
    FRONT_COMPONENT_SHARED_DEPENDENCIES_BANNER_PREFIX.length,
  );

  return /^[a-f0-9]{64}$/.test(checksum) ? checksum : undefined;
};
