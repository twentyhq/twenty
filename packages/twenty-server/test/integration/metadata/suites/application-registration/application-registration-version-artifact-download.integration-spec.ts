import crypto from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import {
  buildNpmRegistryPackage,
  type StubbedRegistryPackage,
} from 'test/integration/metadata/suites/application/utils/build-npm-registry-package.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { insertCatalogApplicationRegistration } from 'test/integration/metadata/suites/application/utils/insert-catalog-application-registration.util';
import {
  type NpmRegistryStub,
  stubNpmRegistry,
} from 'test/integration/metadata/suites/application/utils/stub-npm-registry.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

/* global APP_PORT */

const PACKAGE_NAME = '@twenty-test/artifact-download-app';
const VERSION = '1.0.0';

describe('Application registration version artifact download (integration)', () => {
  const universalIdentifier = crypto.randomUUID();

  let applicationRegistrationId: string;
  let applicationRegistrationVersionId: string;
  let registryPackage: StubbedRegistryPackage;
  let activeStub: NpmRegistryStub | undefined;

  const server = () => request(`http://localhost:${APP_PORT}`);

  const fetchArtifactDownloadUrl = async (): Promise<string> => {
    const response = await makeAdminPanelApiRequest({
      query: gql`
        query FindAdminApplicationRegistrationVersions(
          $applicationRegistrationId: String!
        ) {
          findAdminApplicationRegistrationVersions(
            applicationRegistrationId: $applicationRegistrationId
          ) {
            id
            artifactUrl
            artifactDownloadUrl
          }
        }
      `,
      variables: { applicationRegistrationId },
    });

    expect(response.body.errors).toBeUndefined();

    const [version] =
      response.body.data.findAdminApplicationRegistrationVersions;

    expect(version.id).toBe(applicationRegistrationVersionId);
    expect(version.artifactUrl).toBe(registryPackage.tarballUrl);

    return version.artifactDownloadUrl;
  };

  const downloadArtifact = (downloadUrl: string) => {
    const { pathname, search } = new URL(downloadUrl);

    return server()
      .get(`${pathname}${search}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });
  };

  beforeAll(async () => {
    jest.useRealTimers();

    const registryBaseUrl = getAppProviderByClassName<TwentyConfigService>(
      'TwentyConfigService',
    )
      .get('APP_REGISTRY_URL')
      .replace(/\/$/, '');

    registryPackage = await buildNpmRegistryPackage({
      registryBaseUrl,
      packageName: PACKAGE_NAME,
      version: VERSION,
      manifestJson: JSON.stringify(
        buildBaseManifest({
          appId: universalIdentifier,
          roleId: crypto.randomUUID(),
        }),
      ),
    });

    applicationRegistrationId = await insertCatalogApplicationRegistration({
      universalIdentifier,
      name: 'Artifact download test app',
      sourcePackage: PACKAGE_NAME,
      sourceType: ApplicationRegistrationSourceType.NPM,
      latestAvailableVersion: VERSION,
    });

    const [{ id }] = await globalThis.testDataSource.query(
      `INSERT INTO core."applicationRegistrationVersion"
        ("applicationRegistrationId", version, "sourceType", "sourcePackage", "artifactUrl", checksum)
       VALUES ($1, $2, 'npm', $3, $4, $5)
       RETURNING id`,
      [
        applicationRegistrationId,
        VERSION,
        PACKAGE_NAME,
        registryPackage.tarballUrl,
        computeSriIntegrity({ source: registryPackage.tarballBuffer }),
      ],
    );

    applicationRegistrationVersionId = id;
  });

  afterEach(() => {
    activeStub?.restore();
    activeStub = undefined;
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: universalIdentifier,
    });
    jest.useFakeTimers();
  });

  it('points the download url at this server rather than at the registry', async () => {
    const downloadUrl = new URL(await fetchArtifactDownloadUrl());

    expect(downloadUrl.pathname).toBe(
      `/files/application-registration-versions/${applicationRegistrationVersionId}/artifact`,
    );
    expect(downloadUrl.searchParams.get('token')).toEqual(expect.any(String));
  });

  it('serves the recorded artifact fetched from the registry', async () => {
    const stub = stubNpmRegistry(registryPackage);

    activeStub = stub;

    const response = await downloadArtifact(await fetchArtifactDownloadUrl());

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/gzip');
    expect(response.headers['content-disposition']).toContain(
      `artifact-download-app-${VERSION}.tgz`,
    );
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(
      (response.body as Buffer).equals(registryPackage.tarballBuffer),
    ).toBe(true);
    expect(stub.requestedUrls).toEqual([registryPackage.tarballUrl]);
  });

  it('refuses to serve bytes that differ from the recorded fingerprint', async () => {
    activeStub = stubNpmRegistry({
      ...registryPackage,
      tarballBuffer: Buffer.from('bytes the registry serves today'),
    });

    const response = await downloadArtifact(await fetchArtifactDownloadUrl());

    expect(response.status).toBe(502);
  });

  it('refuses to serve bytes that differ from a recorded sha256 fingerprint', async () => {
    const setRecordedChecksum = (checksum: string) =>
      globalThis.testDataSource.query(
        `UPDATE core."applicationRegistrationVersion" SET checksum = $1 WHERE id = $2`,
        [checksum, applicationRegistrationVersionId],
      );

    await setRecordedChecksum(
      computeSriIntegrity({
        source: registryPackage.tarballBuffer,
        algorithm: 'sha256',
      }),
    );

    activeStub = stubNpmRegistry({
      ...registryPackage,
      tarballBuffer: Buffer.from('bytes the registry serves today'),
    });

    try {
      const response = await downloadArtifact(await fetchArtifactDownloadUrl());

      expect(response.status).toBe(502);
    } finally {
      await setRecordedChecksum(
        computeSriIntegrity({ source: registryPackage.tarballBuffer }),
      );
    }
  });

  it('refuses a download without a token signed for that version', async () => {
    const { pathname, search } = new URL(await fetchArtifactDownloadUrl());

    expect((await server().get(pathname)).status).toBe(403);
    expect((await server().get(`${pathname}?token=not-a-token`)).status).toBe(
      403,
    );
    expect(
      (
        await server().get(
          `/files/application-registration-versions/${crypto.randomUUID()}/artifact${search}`,
        )
      ).status,
    ).toBe(403);
  });
});
