import { type SharedDependenciesExportNames } from '@/front-component-build/shared-dependencies-export-names.type';
import { toSharedDependenciesNamespaceIdentifier } from '@/front-component-build/to-shared-dependencies-namespace-identifier';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from '@/application/constants/FrontComponentSharedDependenciesImportSpecifier';

export const getSharedDependenciesShimSource = ({
  specifier,
  exportNames,
}: {
  specifier: string;
  exportNames: SharedDependenciesExportNames;
}): string => {
  const namespaceIdentifier =
    toSharedDependenciesNamespaceIdentifier(specifier);
  const names = [
    ...exportNames.namedExports,
    ...(exportNames.hasDefaultExport ? ['default'] : []),
  ];

  if (names.length === 0) {
    return `import ${JSON.stringify(FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER)};`;
  }

  return names
    .map(
      (name, index) =>
        `export { ${namespaceIdentifier}_${index} as ${JSON.stringify(name)} } from ${JSON.stringify(FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER)};`,
    )
    .join('\n');
};
