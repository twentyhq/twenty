import { type SharedDependenciesExportNames } from '@/front-component-build/shared-dependencies-export-names.type';

export type SharedDependenciesBuildContext = {
  exportNamesBySpecifier: Map<string, SharedDependenciesExportNames>;
};
