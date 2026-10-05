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
import {
  type NpmRegistryStub,
  stubNpmRegistry,
} from 'test/integration/metadata/suites/application/utils/stub-npm-registry.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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

describe('npm application install package identity (integration)', () => {
  let registryBaseUrl: string;
  let activeStub: NpmRegistryStub | undefined;

  const buildRegistryPackage = ({
    manifestAppId = APP_UNIVERSAL_IDENTIFIER,
    metadataName,
    packageJsonName,
  }: {
    manifestAppId?: string;
    metadataName?: string | null;
    packageJsonName?: string;
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

  it('installs a package whose identity and digest match the registration', async () => {
    const stub = stubNpmRegistry(await buildRegistryPackage());

    activeStub = stub;

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
  });
});
