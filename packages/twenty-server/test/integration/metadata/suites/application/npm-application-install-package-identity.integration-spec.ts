import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import {
  buildNpmRegistryPackage,
  type StubbedRegistryPackage,
} from 'test/integration/metadata/suites/application/utils/build-npm-registry-package.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { insertCatalogApplicationRegistration } from 'test/integration/metadata/suites/application/utils/insert-catalog-application-registration.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import {
  type NpmRegistryStub,
  stubNpmRegistry,
} from 'test/integration/metadata/suites/application/utils/stub-npm-registry.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PACKAGE_NAME = '@twenty-test/install-identity-app';
const APP_UNIVERSAL_IDENTIFIER = 'b4a1a0e2-1b6a-4b2f-9c58-0d2a5d5b6f10';
const FOREIGN_APP_IDENTIFIER = 'e7d3c8f1-5a2b-4c9d-8e6f-1a2b3c4d5e6f';
const ROLE_UNIVERSAL_IDENTIFIER = 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const VALID_VERSION = '1.2.3';
const TRAVERSAL_VERSION = '../@evil/pkg/latest';
const SUBSTITUTE_PACKAGE_NAME = '@evil/substitute-app';

const expectPackageResolutionFailure = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].extensions.code).toBe('INTERNAL_SERVER_ERROR');
  expect(errors[0].extensions.subCode).toBe('PACKAGE_RESOLUTION_FAILED');
};

const expectPackageIntegrityMismatch = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].extensions.code).toBe('INTERNAL_SERVER_ERROR');
  expect(errors[0].extensions.subCode).toBe('PACKAGE_INTEGRITY_MISMATCH');
};

const deleteRecordedVersions = async (): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."applicationRegistrationVersion" WHERE "applicationRegistrationId" IN (
      SELECT id FROM core."applicationRegistration" WHERE "universalIdentifier" = $1
    )`,
    [APP_UNIVERSAL_IDENTIFIER],
  );
};

const insertRecordedVersion = async (tarballUrl: string): Promise<void> => {
  await globalThis.testDataSource.query(
    `INSERT INTO core."applicationRegistrationVersion"
      ("applicationRegistrationId", version, "sourceType", "sourcePackage", "tarballUrl")
     SELECT id, $2, 'npm', $3, $4 FROM core."applicationRegistration"
     WHERE "universalIdentifier" = $1`,
    [APP_UNIVERSAL_IDENTIFIER, VALID_VERSION, PACKAGE_NAME, tarballUrl],
  );
};

const getApplicationRegistrationVersionService = () =>
  getAppProviderByClassName<ApplicationRegistrationVersionService>(
    'ApplicationRegistrationVersionService',
  );

const findInstalledApplication = async (): Promise<
  { applicationRegistrationVersionId: string | null } | undefined
> => {
  const [application] = await globalThis.testDataSource.query(
    `SELECT "applicationRegistrationVersionId" FROM core."application"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [APP_UNIVERSAL_IDENTIFIER, SEED_APPLE_WORKSPACE_ID],
  );

  return application;
};

describe('npm application install package identity (integration)', () => {
  let registryBaseUrl: string;
  let activeStub: NpmRegistryStub | undefined;

  const buildRegistryPackage = ({
    manifestAppId = APP_UNIVERSAL_IDENTIFIER,
    metadataName,
    packageJsonName,
    integrity,
  }: {
    manifestAppId?: string;
    metadataName?: string | null;
    packageJsonName?: string;
    integrity?: string | null;
  } = {}): Promise<StubbedRegistryPackage> =>
    buildNpmRegistryPackage({
      registryBaseUrl,
      packageName: PACKAGE_NAME,
      version: VALID_VERSION,
      manifestJson: JSON.stringify(
        buildBaseManifest({
          appId: manifestAppId,
          roleId: ROLE_UNIVERSAL_IDENTIFIER,
        }),
      ),
      metadataName,
      packageJsonName,
      integrity,
    });

  const expectedMetadataUrl = () =>
    `${registryBaseUrl}/${encodeURIComponent(PACKAGE_NAME)}/${VALID_VERSION}`;

  beforeAll(async () => {
    jest.useRealTimers();

    registryBaseUrl = getAppProviderByClassName<TwentyConfigService>(
      'TwentyConfigService',
    )
      .get('APP_REGISTRY_URL')
      .replace(/\/$/, '');

    await insertCatalogApplicationRegistration({
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Install identity test app',
      sourcePackage: PACKAGE_NAME,
      sourceType: ApplicationRegistrationSourceType.NPM,
    });
  });

  afterEach(() => {
    activeStub?.restore();
    activeStub = undefined;
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
    jest.useFakeTimers();
  });

  it('rejects a path-traversal version before any registry call', async () => {
    const stub = stubNpmRegistry(await buildRegistryPackage());

    activeStub = stub;

    const { errors } = await installApplication({
      input: {
        universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        version: TRAVERSAL_VERSION,
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
    expect(stub.requestedUrls).toEqual([]);
  });

  it('percent-encodes the request and refuses a mismatched registry package name', async () => {
    const stub = stubNpmRegistry(
      await buildRegistryPackage({ metadataName: SUBSTITUTE_PACKAGE_NAME }),
    );

    activeStub = stub;

    const { errors } = await installApplication({
      input: {
        universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        version: VALID_VERSION,
      },
      expectToFail: true,
    });

    expectPackageResolutionFailure(errors);
    // The name check runs on the metadata response, so the tarball is never
    // requested and the version travels percent-encoded in the path.
    expect(stub.requestedUrls).toEqual([expectedMetadataUrl()]);
  });

  it('rejects a package whose package.json name differs from the registration', async () => {
    const stub = stubNpmRegistry(
      await buildRegistryPackage({ packageJsonName: SUBSTITUTE_PACKAGE_NAME }),
    );

    activeStub = stub;

    const { errors } = await installApplication({
      input: {
        universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        version: VALID_VERSION,
      },
      expectToFail: true,
    });

    expectPackageResolutionFailure(errors);
  });

  it('rejects a manifest whose application identifier differs from the registration', async () => {
    const stub = stubNpmRegistry(
      await buildRegistryPackage({ manifestAppId: FOREIGN_APP_IDENTIFIER }),
    );

    activeStub = stub;

    const { errors } = await installApplication({
      input: {
        universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        version: VALID_VERSION,
      },
      expectToFail: true,
    });

    expectPackageResolutionFailure(errors);
  });

  it('refuses a tarball whose bytes differ from the sha512 integrity the registry attests', async () => {
    const stub = stubNpmRegistry(
      await buildRegistryPackage({
        integrity: computeSriIntegrity({
          source: Buffer.from('bytes the registry attested'),
        }),
      }),
    );

    activeStub = stub;

    const { errors } = await installApplication({
      input: {
        universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        version: VALID_VERSION,
      },
      expectToFail: true,
    });

    expectPackageIntegrityMismatch(errors);
    expect(await findInstalledApplication()).toBeUndefined();
  });

  it('links to an npm version recorded concurrently without storing a checksum', async () => {
    const registryPackage = await buildRegistryPackage();

    activeStub = stubNpmRegistry(registryPackage);
    await insertRecordedVersion(registryPackage.tarballUrl);

    const findRecordedVersion = jest
      .spyOn(
        getApplicationRegistrationVersionService(),
        'findOneByApplicationRegistrationIdAndVersion',
      )
      .mockResolvedValueOnce(null);

    try {
      const { errors } = await installApplication({
        input: {
          universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
          version: VALID_VERSION,
        },
      });

      expect(errors).toBeUndefined();
      const application = await findInstalledApplication();
      const [recordedVersion] = await globalThis.testDataSource.query(
        `SELECT id, checksum FROM core."applicationRegistrationVersion" WHERE id = $1`,
        [application?.applicationRegistrationVersionId],
      );

      expect(recordedVersion).toEqual({
        id: application?.applicationRegistrationVersionId,
        checksum: null,
      });
    } finally {
      findRecordedVersion.mockRestore();
      await uninstallApplication({
        universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      });
      await deleteRecordedVersions();
    }
  });

  it('rolls a fresh install back when its version cannot be recorded', async () => {
    activeStub = stubNpmRegistry(await buildRegistryPackage());

    const recordPublishedVersionSpy = jest
      .spyOn(
        getApplicationRegistrationVersionService(),
        'recordPublishedVersion',
      )
      .mockRejectedValueOnce(new Error('version insert failed'));

    try {
      const { errors } = await installApplication({
        input: {
          universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
          version: VALID_VERSION,
        },
        expectToFail: true,
      });

      expect(errors).toHaveLength(1);
      expect(recordPublishedVersionSpy).toHaveBeenCalledTimes(1);
      expect(await findInstalledApplication()).toBeUndefined();
    } finally {
      recordPublishedVersionSpy.mockRestore();
    }
  });

  it.each([
    {
      attestation: 'a sha512 integrity',
      attestIntegrity: (tarballBuffer: Buffer): string | null =>
        computeSriIntegrity({ source: tarballBuffer }),
    },
    {
      attestation: 'only a sha256 integrity',
      attestIntegrity: (): string | null => 'sha256-unsupported',
    },
    {
      attestation: 'a null integrity',
      attestIntegrity: (): string | null => null,
    },
  ])(
    'installs without persisting a checksum when the registry attests $attestation',
    async ({ attestIntegrity }) => {
      const registryPackage = await buildRegistryPackage();

      registryPackage.metadata.dist.integrity = attestIntegrity(
        registryPackage.tarballBuffer,
      );

      const stub = stubNpmRegistry(registryPackage);

      activeStub = stub;

      try {
        const { data, errors } = await installApplication({
          input: {
            universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
            version: VALID_VERSION,
          },
          expectToFail: false,
        });

        expect(errors).toBeUndefined();
        expect(data.installApplication.id).toBeDefined();
        expect(stub.requestedUrls[0]).toBe(expectedMetadataUrl());

        const application = await findInstalledApplication();

        expect(application).toBeDefined();

        const [installedVersion] = await globalThis.testDataSource.query(
          `SELECT id, version, "sourceType", "sourcePackage", "tarballUrl", checksum
           FROM core."applicationRegistrationVersion"
           WHERE id = $1`,
          [application?.applicationRegistrationVersionId],
        );

        expect(installedVersion).toEqual({
          id: application?.applicationRegistrationVersionId,
          version: VALID_VERSION,
          sourceType: 'npm',
          sourcePackage: PACKAGE_NAME,
          tarballUrl: registryPackage.tarballUrl,
          checksum: null,
        });
      } finally {
        await uninstallApplication({
          universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        });
        await deleteRecordedVersions();
      }
    },
  );
});
