import { FRONT_COMPONENT_REQUIRED_SHARED_DEPENDENCIES } from './front-component-required-shared-dependencies';

export const normalizeFrontComponentSharedDependencies = (
  dependencies: string[],
  packageNames: string[] = [],
): string[] => {
  const normalizedDependencies = new Set([
    ...dependencies,
    ...FRONT_COMPONENT_REQUIRED_SHARED_DEPENDENCIES.filter((specifier) =>
      packageNames.some(
        (packageName) =>
          specifier === packageName || specifier.startsWith(`${packageName}/`),
      ),
    ),
  ]);

  if (normalizedDependencies.has('react')) {
    normalizedDependencies.add('react/jsx-runtime');
  }

  return [...normalizedDependencies].sort();
};
