import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { BackfillApplicationRegistrationVersionsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-instance-command-slow-1792077361238-backfill-application-registration-versions';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

const PUBLISHED_AT = new Date('2026-09-01T10:00:00.000Z');

type RegistrationRow = {
  sourceType: string;
  latestAvailableVersion: string | null;
  sourcePackage?: string | null;
  tarballFileId?: string | null;
  deletedAt?: Date | null;
};

describe('2-48 slow instance command 1792077361238 - BackfillApplicationRegistrationVersionsSlowInstanceCommand (integration)', () => {
  const command =
    new BackfillApplicationRegistrationVersionsSlowInstanceCommand();
  let queryRunner: QueryRunner;

  const runBackfill = () =>
    command.runDataMigration(queryRunner.manager as unknown as DataSource);

  const insertTarballFile = async (): Promise<string> => {
    const [{ id }] = await queryRunner.query(
      `INSERT INTO "core"."file" ("workspaceId", size, path)
       VALUES ($1, 1, $2) RETURNING id`,
      [SEED_APPLE_WORKSPACE_ID, `app-tarball/${v4()}.tgz`],
    );

    return id;
  };

  const insertRegistration = async ({
    sourceType,
    latestAvailableVersion,
    sourcePackage = null,
    tarballFileId = null,
    deletedAt = null,
  }: RegistrationRow): Promise<string> => {
    const [{ id }] = await queryRunner.query(
      `INSERT INTO "core"."applicationRegistration"
         ("universalIdentifier", name, "oAuthClientId", "sourceType", "sourcePackage",
          "latestAvailableVersion", "tarballFileId", "workspaceId", "updatedAt", "deletedAt")
       VALUES ($1, 'Backfill test app', $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        v4(),
        v4(),
        sourceType,
        sourcePackage,
        latestAvailableVersion,
        tarballFileId,
        SEED_APPLE_WORKSPACE_ID,
        PUBLISHED_AT,
        deletedAt,
      ],
    );

    return id;
  };

  const insertApplication = async ({
    applicationRegistrationId,
    version,
  }: {
    applicationRegistrationId: string;
    version: string;
  }): Promise<string> => {
    const [{ id }] = await queryRunner.query(
      `INSERT INTO "core"."application"
         ("universalIdentifier", name, "sourcePath", "workspaceId", "applicationRegistrationId", version)
       VALUES ($1, 'Backfill test app', 'backfill-test-app', $2, $3, $4)
       RETURNING id`,
      [v4(), SEED_APPLE_WORKSPACE_ID, applicationRegistrationId, version],
    );

    return id;
  };

  const findVersions = (applicationRegistrationIds: string[]) =>
    queryRunner.query(
      `SELECT id, "applicationRegistrationId", version, "sourceType", "sourcePackage",
              "tarballFileId", "tarballUrl", "publishedAt"
       FROM "core"."applicationRegistrationVersion"
       WHERE "applicationRegistrationId" = ANY($1::uuid[])
       ORDER BY version`,
      [applicationRegistrationIds],
    );

  const findLinkedVersionId = async (
    applicationId: string,
  ): Promise<string | null> => {
    const [{ versionId }] = await queryRunner.query(
      `SELECT version.id AS "versionId" FROM core.application AS application
       LEFT JOIN core."applicationRegistrationVersion" AS version
         ON version."applicationRegistrationId" = application."applicationRegistrationId"
        AND version.version = application.version
       WHERE application.id = $1`,
      [applicationId],
    );

    return versionId;
  };

  beforeEach(async () => {
    queryRunner = global.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('records the latest published version and finds installs through their registration and version', async () => {
    const tarballFileId = await insertTarballFile();
    const tarballRegistrationId = await insertRegistration({
      sourceType: 'tarball',
      latestAvailableVersion: '1.2.0',
      tarballFileId,
    });
    const npmRegistrationId = await insertRegistration({
      sourceType: 'npm',
      latestAvailableVersion: '3.0.0',
      sourcePackage: '@acme/backfill-app',
    });
    const applicationAtLatestVersionId = await insertApplication({
      applicationRegistrationId: tarballRegistrationId,
      version: '1.2.0',
    });
    const applicationAtOlderVersionId = await insertApplication({
      applicationRegistrationId: npmRegistrationId,
      version: '2.0.0',
    });

    await runBackfill();

    const [tarballVersion] = await findVersions([tarballRegistrationId]);
    const [npmVersion] = await findVersions([npmRegistrationId]);

    expect(tarballVersion).toEqual({
      id: expect.any(String),
      applicationRegistrationId: tarballRegistrationId,
      version: '1.2.0',
      sourceType: 'tarball',
      sourcePackage: null,
      tarballFileId,
      tarballUrl: null,
      publishedAt: PUBLISHED_AT,
    });
    expect(npmVersion).toEqual({
      id: expect.any(String),
      applicationRegistrationId: npmRegistrationId,
      version: '3.0.0',
      sourceType: 'npm',
      sourcePackage: '@acme/backfill-app',
      tarballFileId: null,
      tarballUrl: null,
      publishedAt: PUBLISHED_AT,
    });
    expect(await findLinkedVersionId(applicationAtLatestVersionId)).toBe(
      tarballVersion.id,
    );
    expect(await findLinkedVersionId(applicationAtOlderVersionId)).toBeNull();
  });

  it('skips registrations that have no published version to record', async () => {
    const skippedRegistrationIds = [
      await insertRegistration({
        sourceType: 'local',
        latestAvailableVersion: '1.0.0',
      }),
      await insertRegistration({
        sourceType: 'oauth-only',
        latestAvailableVersion: '1.0.0',
      }),
      await insertRegistration({
        sourceType: 'npm',
        latestAvailableVersion: null,
        sourcePackage: '@acme/unpublished-app',
      }),
      await insertRegistration({
        sourceType: 'tarball',
        latestAvailableVersion: '1.0.0',
        tarballFileId: await insertTarballFile(),
        deletedAt: PUBLISHED_AT,
      }),
    ];

    await runBackfill();

    expect(await findVersions(skippedRegistrationIds)).toEqual([]);
  });

  it('keeps an already recorded version untouched and can run again without duplicating it', async () => {
    const registrationId = await insertRegistration({
      sourceType: 'npm',
      latestAvailableVersion: '1.0.0',
      sourcePackage: '@acme/recorded-app',
    });
    const [{ id: recordedVersionId }] = await queryRunner.query(
      `INSERT INTO "core"."applicationRegistrationVersion"
         ("applicationRegistrationId", version, "sourceType", "sourcePackage", "tarballUrl")
       VALUES ($1, '1.0.0', 'npm', '@acme/recorded-app', $2)
       RETURNING id`,
      [
        registrationId,
        'https://registry.npmjs.org/@acme/recorded-app/-/recorded-app-1.0.0.tgz',
      ],
    );
    const applicationId = await insertApplication({
      applicationRegistrationId: registrationId,
      version: '1.0.0',
    });

    await runBackfill();
    await runBackfill();

    expect(await findVersions([registrationId])).toEqual([
      expect.objectContaining({
        id: recordedVersionId,
        version: '1.0.0',
        tarballUrl:
          'https://registry.npmjs.org/@acme/recorded-app/-/recorded-app-1.0.0.tgz',
      }),
    ]);
    expect(await findLinkedVersionId(applicationId)).toBe(recordedVersionId);
  });
});
