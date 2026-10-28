import { type SharedDependenciesExportNames } from '@/front-component-build/shared-dependencies-export-names.type';
import { toSharedDependenciesNamespaceIdentifier } from '@/front-component-build/to-shared-dependencies-namespace-identifier';

export const getSharedDependenciesEntrySource = (
  exportNamesBySpecifier: Map<string, SharedDependenciesExportNames>,
): string =>
  [...exportNamesBySpecifier]
    .map(([specifier, exportNames]) => {
      const namespaceIdentifier =
        toSharedDependenciesNamespaceIdentifier(specifier);
      const names = [
        ...exportNames.namedExports,
        ...(exportNames.hasDefaultExport ? ['default'] : []),
      ];

      return [
        `export * as ${namespaceIdentifier} from ${JSON.stringify(specifier)};`,
        ...names.map(
          (name, index) =>
            `export { ${JSON.stringify(name)} as ${namespaceIdentifier}_${index} } from ${JSON.stringify(specifier)};`,
        ),
      ].join('\n');
    })
    .join('\n');
