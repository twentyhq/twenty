export type PackageJson = {
  name: string;
  license: string;
  engines: {
    node: string;
    npm: string;
    yarn: string;
  };
  packageManager: string;
  version: string;
  dependencies?: object;
  devDependencies?: object;
};
