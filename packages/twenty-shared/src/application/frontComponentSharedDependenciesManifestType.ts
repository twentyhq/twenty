export type FrontComponentSharedDependenciesManifest = {
  dependencies: string[];
  sourcePath: string;
  builtPath: string;
  builtChecksum: string | null;
};
