import crypto from 'crypto';

import gql from 'graphql-tag';
import { type ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { completeAppTarballUpload } from 'test/integration/metadata/suites/application/utils/complete-app-tarball-upload.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import {
  type AppTarballUploadTarget,
  createAppTarballUpload,
} from 'test/integration/metadata/suites/application/utils/create-app-tarball-upload.util';
import { putApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/put-application-file-upload-target.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type DataSource } from 'typeorm';

const buildManifest = (universalIdentifier: string) =>
  JSON.stringify({
    application: {
      universalIdentifier,
      displayName: 'Direct Tarball App',
      description: 'An app deployed straight to storage',
      icon: 'IconTestPipe',
      defaultRoleUniversalIdentifier: crypto.randomUUID(),
      applicationVariables: {},
      packageJsonChecksum: null,
      yarnLockChecksum: null,
    },
    roles: [],
    skills: [],
    objects: [],
    fields: [],
    logicFunctions: [],
    frontComponents: [],
    publicAssets: [],
    views: [],
    navigationMenuItems: [],
    pageLayouts: [],
    pageLayoutTabs: [],
    pageLayoutWidgets: [],
  });

const buildPackageJson = (version: string) =>
  JSON.stringify({ name: 'direct-tarball-app', version });

const buildValidTarball = ({
  universalIdentifier,
  version,
}: {
  universalIdentifier: string;
  version: string;
}) =>
  createAppTarball({
    'manifest.json': buildManifest(universalIdentifier),
    'package.json': buildPackageJson(version),
  });

describe('Direct app tarball upload', () => {
  let ds: DataSource;
  const createdRegistrationIds: string[] = [];
  const createdFileIds: string[] = [];

  const sendToStorage = async (tarball: Buffer) => {
    const { data, errors } = await createAppTarballUpload({
      size: tarball.length,
    });

    expect(errors).toBeUndefined();

    const uploadTarget = data!.createFileUpload;

    createdFileIds.push(uploadTarget.fileId);

    const putResponse = await putApplicationFileUploadTarget({
      uploadTarget,
      body: tarball,
    });

    expect(putResponse.status).toBe(204);

    return uploadTarget;
  };

  const deployTarball = async (
    tarball: Buffer,
    { expectToFail = false }: { expectToFail?: boolean } = {},
  ) => {
    const uploadTarget = await sendToStorage(tarball);

    const completion = await completeAppTarballUpload({
      fileId: uploadTarget.fileId,
      expectToFail,
    });

    if (completion.data?.completeAppTarballUpload) {
      createdRegistrationIds.push(completion.data.completeAppTarballUpload.id);
    }

    return { uploadTarget, completion };
  };

  const completeFileUploadGenerically = async (fileId: string) => {
    const response = await makeMetadataApiRequest({
      query: gql`
        mutation CompleteFileUpload($fileId: String!) {
          completeFileUpload(fileId: $fileId) {
            id
          }
        }
      `,
      variables: { fileId },
    });

    return response.body;
  };

  const findFileRow = async (fileId: string) => {
    const [row] = await ds.query(
      `SELECT status, "mimeType", path, size FROM core."file" WHERE id = $1`,
      [fileId],
    );

    return row ?? null;
  };

  const findRegistrationRow = async (registrationId: string) => {
    const [row] = await ds.query(
      `SELECT "sourceType", "tarballFileId", "latestAvailableVersion"
       FROM core."applicationRegistration" WHERE id = $1`,
      [registrationId],
    );

    return row ?? null;
  };

  beforeAll(() => {
    jest.useRealTimers();
    ds = global.testDataSource;
  });

  afterAll(async () => {
    for (const id of new Set(createdRegistrationIds)) {
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE id = $1`,
        [id],
      );
    }

    for (const id of createdFileIds) {
      await ds.query(`DELETE FROM core."file" WHERE id = $1`, [id]);
    }

    jest.useFakeTimers();
  });

  it('registers the app from a tarball sent straight to storage', async () => {
    const universalIdentifier = crypto.randomUUID();
    const tarball = await buildValidTarball({
      universalIdentifier,
      version: '1.0.0',
    });

    const {
      uploadTarget,
      completion: { data, errors },
    } = await deployTarball(tarball);

    expect(errors).toBeUndefined();
    expect(data?.completeAppTarballUpload.universalIdentifier).toBe(
      universalIdentifier,
    );
    expect(data?.completeAppTarballUpload.name).toBe('Direct Tarball App');

    const registration = await findRegistrationRow(
      data!.completeAppTarballUpload.id,
    );

    expect(registration).toEqual({
      sourceType: 'tarball',
      tarballFileId: uploadTarget.fileId,
      latestAvailableVersion: '1.0.0',
    });

    const file = await findFileRow(uploadTarget.fileId);

    expect(file.status).toBe('UPLOADED');
    expect(file.mimeType).toBe('application/gzip');
    expect(file.path).toBe(`app-tarball/${uploadTarget.fileId}.gz`);
    expect(Number(file.size)).toBe(tarball.length);
  });

  it('answers a repeated completion with the same registration', async () => {
    const universalIdentifier = crypto.randomUUID();
    const tarball = await buildValidTarball({
      universalIdentifier,
      version: '1.0.0',
    });

    const { uploadTarget, completion } = await deployTarball(tarball);

    const { data, errors } = await completeAppTarballUpload({
      fileId: uploadTarget.fileId,
    });

    expect(errors).toBeUndefined();
    expect(data?.completeAppTarballUpload.id).toBe(
      completion.data?.completeAppTarballUpload.id,
    );
  });

  it('replaces the previous tarball on a new version and drops it', async () => {
    const universalIdentifier = crypto.randomUUID();

    const first = await deployTarball(
      await buildValidTarball({ universalIdentifier, version: '1.0.0' }),
    );

    expect(first.completion.errors).toBeUndefined();

    const second = await deployTarball(
      await buildValidTarball({ universalIdentifier, version: '1.1.0' }),
    );

    expect(second.completion.errors).toBeUndefined();
    expect(second.completion.data?.completeAppTarballUpload.id).toBe(
      first.completion.data?.completeAppTarballUpload.id,
    );

    const registration = await findRegistrationRow(
      first.completion.data!.completeAppTarballUpload.id,
    );

    expect(registration.tarballFileId).toBe(second.uploadTarget.fileId);
    expect(registration.latestAvailableVersion).toBe('1.1.0');

    expect(await findFileRow(first.uploadTarget.fileId)).toBeNull();
    expect((await findFileRow(second.uploadTarget.fileId)).status).toBe(
      'UPLOADED',
    );
  });

  it('refuses a version that does not progress and drops the promoted file', async () => {
    const universalIdentifier = crypto.randomUUID();

    const first = await deployTarball(
      await buildValidTarball({ universalIdentifier, version: '1.0.0' }),
    );

    expect(first.completion.errors).toBeUndefined();

    const second = await deployTarball(
      await buildValidTarball({ universalIdentifier, version: '1.0.0' }),
      { expectToFail: true },
    );

    expect(
      second.completion.errors?.some((error: { message: string }) =>
        error.message.includes(
          'version must be higher than the currently deployed version',
        ),
      ),
    ).toBe(true);

    expect(await findFileRow(second.uploadTarget.fileId)).toBeNull();

    const registration = await findRegistrationRow(
      first.completion.data!.completeAppTarballUpload.id,
    );

    expect(registration.tarballFileId).toBe(first.uploadTarget.fileId);
  });

  it('registers a promoted upload whose registration was lost', async () => {
    const universalIdentifier = crypto.randomUUID();

    const { uploadTarget, completion } = await deployTarball(
      await buildValidTarball({ universalIdentifier, version: '1.0.0' }),
    );

    expect(completion.errors).toBeUndefined();

    await ds.query(`DELETE FROM core."applicationRegistration" WHERE id = $1`, [
      completion.data!.completeAppTarballUpload.id,
    ]);

    const { data, errors } = await completeAppTarballUpload({
      fileId: uploadTarget.fileId,
    });

    expect(errors).toBeUndefined();
    expect(data?.completeAppTarballUpload.universalIdentifier).toBe(
      universalIdentifier,
    );

    createdRegistrationIds.push(data!.completeAppTarballUpload.id);

    const registration = await findRegistrationRow(
      data!.completeAppTarballUpload.id,
    );

    expect(registration.tarballFileId).toBe(uploadTarget.fileId);
    expect((await findFileRow(uploadTarget.fileId)).status).toBe('UPLOADED');
  });

  it('keeps the registration on the new tarball when a step after attaching it fails', async () => {
    const universalIdentifier = crypto.randomUUID();

    const first = await deployTarball(
      await buildValidTarball({ universalIdentifier, version: '1.0.0' }),
    );

    expect(first.completion.errors).toBeUndefined();

    const storeRegistrationAssetsSpy = jest
      .spyOn(
        getAppProviderByClassName<ApplicationRegistrationAssetService>(
          'ApplicationRegistrationAssetService',
        ),
        'storeRegistrationAssets',
      )
      .mockRejectedValueOnce(new Error('Asset storage unavailable'));

    try {
      const second = await deployTarball(
        await buildValidTarball({ universalIdentifier, version: '1.1.0' }),
        { expectToFail: true },
      );

      expect(second.completion.errors).toBeDefined();

      const registration = await findRegistrationRow(
        first.completion.data!.completeAppTarballUpload.id,
      );

      expect(registration.tarballFileId).toBe(second.uploadTarget.fileId);
      expect((await findFileRow(second.uploadTarget.fileId)).status).toBe(
        'UPLOADED',
      );
      expect((await findFileRow(first.uploadTarget.fileId)).status).toBe(
        'UPLOADED',
      );
    } finally {
      storeRegistrationAssetsSpy.mockRestore();
    }
  });

  it('reruns the asset and upgrade steps when a completion is retried after a late failure', async () => {
    const universalIdentifier = crypto.randomUUID();

    const first = await deployTarball(
      await buildValidTarball({ universalIdentifier, version: '1.0.0' }),
    );

    expect(first.completion.errors).toBeUndefined();

    const storeRegistrationAssetsSpy = jest
      .spyOn(
        getAppProviderByClassName<ApplicationRegistrationAssetService>(
          'ApplicationRegistrationAssetService',
        ),
        'storeRegistrationAssets',
      )
      .mockRejectedValueOnce(new Error('Asset storage unavailable'));
    const enqueueAutoUpgradeSpy = jest.spyOn(
      getAppProviderByClassName<ApplicationRegistrationService>(
        'ApplicationRegistrationService',
      ),
      'enqueueAutoUpgradeApplications',
    );

    try {
      const second = await deployTarball(
        await buildValidTarball({ universalIdentifier, version: '1.1.0' }),
        { expectToFail: true },
      );

      expect(second.completion.errors).toBeDefined();
      expect(enqueueAutoUpgradeSpy).not.toHaveBeenCalled();

      const { data, errors } = await completeAppTarballUpload({
        fileId: second.uploadTarget.fileId,
      });

      expect(errors).toBeUndefined();
      expect(data?.completeAppTarballUpload.id).toBe(
        first.completion.data?.completeAppTarballUpload.id,
      );
      expect(storeRegistrationAssetsSpy).toHaveBeenCalledTimes(2);
      expect(enqueueAutoUpgradeSpy).toHaveBeenCalledTimes(1);
      expect(enqueueAutoUpgradeSpy).toHaveBeenCalledWith(
        first.completion.data?.completeAppTarballUpload.id,
      );
    } finally {
      storeRegistrationAssetsSpy.mockRestore();
      enqueueAutoUpgradeSpy.mockRestore();
    }
  });

  it('refuses a completion that overlaps another completion of the same upload', async () => {
    const uploadTarget = await sendToStorage(
      await buildValidTarball({
        universalIdentifier: crypto.randomUUID(),
        version: '1.0.0',
      }),
    );

    const assetService =
      getAppProviderByClassName<ApplicationRegistrationAssetService>(
        'ApplicationRegistrationAssetService',
      );
    const storeRegistrationAssets =
      assetService.storeRegistrationAssets.bind(assetService);

    let releaseFirstCompletion = () => {};
    const firstCompletionGate = new Promise<void>((resolve) => {
      releaseFirstCompletion = resolve;
    });

    const storeRegistrationAssetsSpy = jest
      .spyOn(assetService, 'storeRegistrationAssets')
      .mockImplementationOnce(async (args) => {
        await firstCompletionGate;

        return storeRegistrationAssets(args);
      });

    try {
      const firstCompletion = completeAppTarballUpload({
        fileId: uploadTarget.fileId,
      });

      while (storeRegistrationAssetsSpy.mock.calls.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      const overlapping = await completeAppTarballUpload({
        fileId: uploadTarget.fileId,
        expectToFail: true,
      });

      expect(overlapping.errors?.[0].extensions.code).toBe('CONFLICT');
      expect(overlapping.errors?.[0].message).toContain(
        'already being completed',
      );

      releaseFirstCompletion();

      const first = await firstCompletion;

      expect(first.errors).toBeUndefined();

      createdRegistrationIds.push(first.data!.completeAppTarballUpload.id);

      const retried = await completeAppTarballUpload({
        fileId: uploadTarget.fileId,
      });

      expect(retried.errors).toBeUndefined();
      expect(retried.data?.completeAppTarballUpload.id).toBe(
        first.data?.completeAppTarballUpload.id,
      );
    } finally {
      releaseFirstCompletion();
      storeRegistrationAssetsSpy.mockRestore();
    }
  });

  it('refuses the generic completion for a tarball reservation', async () => {
    const uploadTarget = await sendToStorage(
      await buildValidTarball({
        universalIdentifier: crypto.randomUUID(),
        version: '1.0.0',
      }),
    );

    const { data, errors } = await completeFileUploadGenerically(
      uploadTarget.fileId,
    );

    expect(data?.completeFileUpload ?? null).toBeNull();
    expect(errors?.[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(errors?.[0].message).toContain('dedicated mutation');
    expect((await findFileRow(uploadTarget.fileId)).status).toBe('PENDING');

    const completion = await completeAppTarballUpload({
      fileId: uploadTarget.fileId,
    });

    expect(completion.errors).toBeUndefined();

    createdRegistrationIds.push(completion.data!.completeAppTarballUpload.id);
  });

  it('rejects a tarball without a manifest and drops the promoted file', async () => {
    const tarball = await createAppTarball({
      'readme.txt': 'no manifest here',
    });

    const {
      uploadTarget,
      completion: { errors },
    } = await deployTarball(tarball, { expectToFail: true });

    expect(
      errors?.some((error: { message: string }) =>
        error.message.includes('manifest.json'),
      ),
    ).toBe(true);

    expect(await findFileRow(uploadTarget.fileId)).toBeNull();
  });

  it('rejects a payload that is not a gzip archive before promoting it', async () => {
    const body = Buffer.from('definitely not a tarball');

    const { data } = await createAppTarballUpload({ size: body.length });
    const uploadTarget = data!.createFileUpload;

    createdFileIds.push(uploadTarget.fileId);

    const putResponse = await putApplicationFileUploadTarget({
      uploadTarget,
      body,
    });

    expect(putResponse.status).toBe(204);

    const { errors } = await completeAppTarballUpload({
      fileId: uploadTarget.fileId,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect((await findFileRow(uploadTarget.fileId)).status).toBe('PENDING');
  });

  it('refuses to finalize an upload whose bytes never reached storage', async () => {
    const tarball = await buildValidTarball({
      universalIdentifier: crypto.randomUUID(),
      version: '1.0.0',
    });

    const { data } = await createAppTarballUpload({ size: tarball.length });
    const uploadTarget: AppTarballUploadTarget = data!.createFileUpload;

    createdFileIds.push(uploadTarget.fileId);

    const { errors } = await completeAppTarballUpload({
      fileId: uploadTarget.fileId,
      expectToFail: true,
    });

    expect(
      errors?.some((error: { message: string }) =>
        error.message.includes('has not been uploaded'),
      ),
    ).toBe(true);
    expect(errors?.[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('rejects an unknown upload', async () => {
    const { errors } = await completeAppTarballUpload({
      fileId: crypto.randomUUID(),
      expectToFail: true,
    });

    expect(
      errors?.some((error: { message: string }) =>
        error.message.includes('not found'),
      ),
    ).toBe(true);
  });

  it('rejects a declared size above the direct upload limit', async () => {
    const { errors } = await createAppTarballUpload({
      size: 1024 * 1024 * 1024 + 1,
      expectToFail: true,
    });

    expect(
      errors?.some((error: { message: string }) =>
        error.message.includes('Invalid file size'),
      ),
    ).toBe(true);
    expect(errors?.[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
