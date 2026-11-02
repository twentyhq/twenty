import { type SharedDependenciesBuildContext } from 'twenty-shared/front-component-build';

export type FrontComponentSharedDependencies =
  SharedDependenciesBuildContext & {
    source: string;
    checksum: string;
  };
