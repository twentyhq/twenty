import { normalizeFrontComponentSharedDependencies } from 'twenty-shared/front-component-build';

import { AI_FRONT_COMPONENT_SHARED_DEPENDENCIES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/ai-front-component-shared-dependencies.constant';

export const getAiFrontComponentSharedDependencies = ({
  declaredDependencies,
  installedPackageNames,
}: {
  declaredDependencies: string[];
  installedPackageNames: string[];
}): string[] =>
  normalizeFrontComponentSharedDependencies({
    dependencies: [
      ...declaredDependencies,
      ...AI_FRONT_COMPONENT_SHARED_DEPENDENCIES.filter((specifier) =>
        installedPackageNames.some(
          (packageName) =>
            specifier === packageName ||
            specifier.startsWith(`${packageName}/`),
        ),
      ),
    ],
  });
