export const normalizeFrontComponentSharedDependencies = ({
  dependencies,
}: {
  dependencies: string[];
}): string[] => {
  const normalizedDependencies = new Set(dependencies);

  if (normalizedDependencies.has('react')) {
    normalizedDependencies.add('react/jsx-runtime');
  }

  if (normalizedDependencies.has('react-dom/client')) {
    normalizedDependencies.add('react-dom');
  }

  return [...normalizedDependencies].sort();
};
