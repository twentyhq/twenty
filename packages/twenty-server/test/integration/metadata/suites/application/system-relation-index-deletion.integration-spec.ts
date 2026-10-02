import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const TEST_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  nameSingular: 'indexLifecycleTicket',
  namePlural: 'indexLifecycleTickets',
  labelSingular: 'Index Lifecycle Ticket',
  labelPlural: 'Index Lifecycle Tickets',
});

const buildManifest = (includeObject: boolean) =>
  buildBaseManifest({
    appId: APPLICATION_UNIVERSAL_IDENTIFIER,
    roleId: ROLE_UNIVERSAL_IDENTIFIER,
    overrides: { objects: includeObject ? [TEST_OBJECT] : [] },
  });

const setupApplication = () =>
  setupApplicationForSync({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'Index Lifecycle Application',
    description: 'Tests deletion of legacy system relation indexes',
    sourcePath: 'test-index-lifecycle',
  });

type RelationIndex = {
  id: string;
  name: string;
  universalIdentifier: string;
  fieldMetadataId: string;
  objectMetadataId: string;
};

const findRelationIndexes = (): Promise<RelationIndex[]> =>
  globalThis.testDataSource.query(
    `SELECT i.id, i.name, i."universalIdentifier", i."objectMetadataId",
            f.id AS "fieldMetadataId"
     FROM core."indexMetadata" i
     JOIN core."indexFieldMetadata" indexed ON indexed."indexMetadataId" = i.id
     JOIN core."fieldMetadata" f ON f.id = indexed."fieldMetadataId"
     JOIN core."objectMetadata" target ON target.id = f."relationTargetObjectMetadataId"
     WHERE target."universalIdentifier" = $1 AND i."workspaceId" = $2
       AND f."isSystemSideEffect" = true`,
    [TEST_OBJECT.universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

const findPhysicalIndexes = (
  names: string[],
): Promise<{ indexname: string }[]> =>
  globalThis.testDataSource.query(
    `SELECT indexname FROM pg_indexes
     WHERE schemaname = $1 AND indexname = ANY($2::text[])`,
    [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID), names],
  );

describe.each(['sync', 'uninstall'] as const)(
  'System relation index deletion through %s',
  (deletionMethod) => {
    beforeEach(setupApplication, 60000);

    afterEach(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });
    });

    it.each([
      ['another application', TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
      ['the same application', APPLICATION_UNIVERSAL_IDENTIFIER],
    ])(
      'deletes legacy indexes owned by %s and allows recreation',
      async (_, indexOwnerUniversalIdentifier) => {
        await syncApplication({
          manifest: buildManifest(true),
          expectToFail: false,
        });

        const indexes = await findRelationIndexes();

        expect(indexes.length).toBeGreaterThan(0);

        const indexIds = indexes.map(({ id }) => id);
        const indexNames = indexes.map(({ name }) => name);
        const fieldIds = indexes.map(({ fieldMetadataId }) => fieldMetadataId);
        const unrelatedIndexes = await globalThis.testDataSource.query<
          { id: string }[]
        >(
          `SELECT id FROM core."indexMetadata"
         WHERE "workspaceId" = $1 AND "objectMetadataId" = ANY($2::uuid[])
           AND NOT (id = ANY($3::uuid[]))`,
          [
            SEED_APPLE_WORKSPACE_ID,
            indexes.map(({ objectMetadataId }) => objectMetadataId),
            indexIds,
          ],
        );

        expect(unrelatedIndexes.length).toBeGreaterThan(0);
        expect(await findPhysicalIndexes(indexNames)).toHaveLength(
          indexes.length,
        );

        // Older backfills left these indexes unflagged and sometimes owned by Twenty Standard.
        await globalThis.testDataSource.query(
          `UPDATE core."indexMetadata" SET "isSystemSideEffect" = false,
           "applicationId" = (
             SELECT id FROM core."application"
             WHERE "universalIdentifier" = $1 AND "workspaceId" = $2
           )
         WHERE id = ANY($3::uuid[]) AND "workspaceId" = $2`,
          [indexOwnerUniversalIdentifier, SEED_APPLE_WORKSPACE_ID, indexIds],
        );

        await getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
          'flatIndexMaps',
          'flatObjectMetadataMaps',
        ]);

        if (deletionMethod === 'sync') {
          const { data } = await syncApplication({
            manifest: buildManifest(false),
            expectToFail: false,
          });

          for (const index of indexes) {
            expect(
              data.syncApplication.actions.filter(
                (action) =>
                  action.type === 'delete' &&
                  action.metadataName === 'index' &&
                  action.universalIdentifier === index.universalIdentifier,
              ),
            ).toHaveLength(1);
          }
        } else {
          const { data } = await uninstallApplication({
            universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            expectToFail: false,
          });

          expect(data.uninstallApplication).toBe(true);
        }

        expect(
          await globalThis.testDataSource.query(
            'SELECT id FROM core."indexMetadata" WHERE id = ANY($1::uuid[])',
            [indexIds],
          ),
        ).toEqual([]);
        expect(
          await globalThis.testDataSource.query(
            'SELECT id FROM core."indexFieldMetadata" WHERE "indexMetadataId" = ANY($1::uuid[])',
            [indexIds],
          ),
        ).toEqual([]);
        expect(
          await globalThis.testDataSource.query(
            'SELECT id FROM core."fieldMetadata" WHERE id = ANY($1::uuid[])',
            [fieldIds],
          ),
        ).toEqual([]);
        expect(await findPhysicalIndexes(indexNames)).toEqual([]);
        expect(
          await globalThis.testDataSource.query(
            'SELECT id FROM core."indexMetadata" WHERE id = ANY($1::uuid[])',
            [unrelatedIndexes.map(({ id }) => id)],
          ),
        ).toHaveLength(unrelatedIndexes.length);

        if (deletionMethod === 'uninstall') {
          await cleanupApplicationAndAppRegistration({
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          });
          await setupApplication();
        }

        await syncApplication({
          manifest: buildManifest(true),
          expectToFail: false,
        });

        expect(
          (await findRelationIndexes()).map(({ name }) => name).sort(),
        ).toEqual(indexNames.sort());
        expect(await findPhysicalIndexes(indexNames)).toHaveLength(
          indexes.length,
        );

        const { data: resyncData } = await syncApplication({
          manifest: buildManifest(true),
          expectToFail: false,
        });

        expect(resyncData.syncApplication.actions).toEqual([]);
      },
      60000,
    );
  },
);
