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

  const lines = [
    `import { ${namespaceIdentifier} } from ${JSON.stringify(FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER)};`,
  ];

  for (const [index, exportName] of exportNames.namedExports.entries()) {
    lines.push(
      `const __sharedDependenciesExport${index} = ${namespaceIdentifier}[${JSON.stringify(exportName)}];`,
      `export { __sharedDependenciesExport${index} as ${JSON.stringify(exportName)} };`,
    );
  }

  if (exportNames.hasDefaultExport) {
    lines.push(`export default ${namespaceIdentifier}.default;`);
  }

  return lines.join('\n');
};
