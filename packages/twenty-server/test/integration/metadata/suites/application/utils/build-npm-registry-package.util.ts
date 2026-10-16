import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';

type RegistryVersionMetadata = {
  name: string | null;
  dist: { tarball: string };
};

export type StubbedRegistryPackage = {
  tarballUrl: string;
  tarballBuffer: Buffer;
  metadata: RegistryVersionMetadata;
};

// Builds the registry metadata and tarball a stubbed npm registry serves for
// one package version. Overrides let a test forge the mismatches the install
// path must reject: a metadata or package.json name that is not the requested
// package, or a manifest identifier that is not the registration's.
export const buildNpmRegistryPackage = async ({
  registryBaseUrl,
  packageName,
  version,
  manifestJson,
  packageJsonName = packageName,
  metadataName = packageName,
}: {
  registryBaseUrl: string;
  packageName: string;
  version: string;
  manifestJson: string;
  packageJsonName?: string;
  metadataName?: string | null;
}): Promise<StubbedRegistryPackage> => {
  const tarballBuffer = await createAppTarball({
    'manifest.json': manifestJson,
    'package.json': JSON.stringify({ name: packageJsonName, version }),
  });

  const unscopedName = packageName.split('/').pop() ?? packageName;
  const tarballUrl = `${registryBaseUrl}/${packageName}/-/${unscopedName}-${version}.tgz`;

  return {
    tarballUrl,
    tarballBuffer,
    metadata: {
      name: metadataName,
      dist: { tarball: tarballUrl },
    },
  };
};
