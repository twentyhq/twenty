import crypto from 'crypto';

import bcrypt from 'bcrypt';
import request from 'supertest';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { createViewGroupQueryFactory } from 'test/integration/metadata/suites/view-group/utils/create-view-group-query-factory.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { createViewQueryFactory } from 'test/integration/metadata/suites/view/utils/create-view-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const baseUrl = `http://localhost:${APP_PORT}`;

type InstalledApplication = {
  applicationUniversalIdentifier: string;
  applicationId: string;
  accessToken: string;
};

const installApplicationGrantingViews = async ({
  name,
  grantsViewsPermission,
}: {
  name: string;
  grantsViewsPermission: boolean;
}): Promise<InstalledApplication> => {
  const applicationUniversalIdentifier = crypto.randomUUID();
  const roleUniversalIdentifier = crypto.randomUUID();

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: name,
    sourcePath: name,
  });

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: roleUniversalIdentifier,
      overrides: {
        roles: [
          {
            universalIdentifier: roleUniversalIdentifier,
            label: `${name} role`,
            description: 'Role used by the application view access suite',
            canUpdateAllSettings: false,
            canReadAllObjectRecords: true,
            canUpdateAllObjectRecords: true,
            permissionFlagUniversalIdentifiers: grantsViewsPermission
              ? [SystemPermissionFlag.VIEWS]
              : [],
          },
        ],
      },
    }),
  });

  const [{ id: applicationId, applicationRegistrationId }] =
    await globalThis.testDataSource.query(
      `SELECT id, "applicationRegistrationId" FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [applicationUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

  const clientSecret = crypto.randomBytes(32).toString('hex');

  await globalThis.testDataSource.query(
    `UPDATE core."applicationRegistration"
     SET "oAuthClientSecretHash" = $1, "oAuthScopes" = $2
     WHERE id = $3`,
    [
      await bcrypt.hash(clientSecret, 10),
      ['read', 'write'],
      applicationRegistrationId,
    ],
  );

  const [{ oAuthClientId }] = await globalThis.testDataSource.query(
    `SELECT "oAuthClientId" FROM core."applicationRegistration" WHERE id = $1`,
    [applicationRegistrationId],
  );

  const tokenResponse = await request(baseUrl).post('/oauth/token').send({
    grant_type: 'client_credentials',
    client_id: oAuthClientId,
    client_secret: clientSecret,
  });

  if (tokenResponse.status !== 200) {
    throw new Error(
      `client_credentials grant failed (${tokenResponse.status}): ${JSON.stringify(
        tokenResponse.body,
      )}`,
    );
  }

  const accessToken: string = tokenResponse.body.access_token;

  return { applicationUniversalIdentifier, applicationId, accessToken };
};

const createViewAsApplication = ({
  token,
  name,
  objectMetadataId,
}: {
  token: string;
  name: string;
  objectMetadataId: string;
}) =>
  makeMetadataApiRequest(
    createViewQueryFactory({
      input: {
        name,
        objectMetadataId,
        icon: 'IconTable',
        type: ViewType.TABLE,
        visibility: ViewVisibility.WORKSPACE,
      },
    }),
    token,
  );

const createViewGroupAsApplication = ({
  token,
  viewId,
  fieldValue,
}: {
  token: string;
  viewId: string;
  fieldValue: string;
}) =>
  makeMetadataApiRequest(
    createViewGroupQueryFactory({
      input: { viewId, fieldValue },
    }),
    token,
  );

describe('application principal view access (integration)', () => {
  let authorizedApplication: InstalledApplication;
  let deniedApplication: InstalledApplication;
  let objectMetadataId: string;
  let groupedViewId: string;

  beforeAll(async () => {
    authorizedApplication = await installApplicationGrantingViews({
      name: `views-granted-${crypto.randomUUID().slice(0, 8)}`,
      grantsViewsPermission: true,
    });

    deniedApplication = await installApplicationGrantingViews({
      name: `views-denied-${crypto.randomUUID().slice(0, 8)}`,
      grantsViewsPermission: false,
    });

    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: getMockCreateObjectInput({
        nameSingular: 'appViewTarget',
        namePlural: 'appViewTargets',
        labelSingular: 'App View Target',
        labelPlural: 'App View Targets',
        isLabelSyncedWithName: false,
      }),
    });

    objectMetadataId = createOneObject.id;

    const {
      data: { createOneField },
    } = await createOneFieldMetadata<typeof FieldMetadataType.SELECT>({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'stage',
        label: 'Stage',
        isLabelSyncedWithName: true,
        options: [
          { label: 'New', value: 'NEW', color: 'green', position: 0 },
          { label: 'Done', value: 'DONE', color: 'blue', position: 1 },
        ],
      },
      gqlFields: 'id',
    });

    const {
      data: { createView: groupedView },
    } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Shared Grouped View',
        objectMetadataId,
        icon: 'IconLayoutKanban',
        type: ViewType.TABLE,
        visibility: ViewVisibility.WORKSPACE,
        mainGroupByFieldMetadataId: createOneField.id,
      },
    });

    groupedViewId = groupedView.id;
  }, 180000);

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        authorizedApplication.applicationUniversalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        deniedApplication.applicationUniversalIdentifier,
    });
  }, 120000);

  describe('an application whose role grants the VIEWS permission', () => {
    it('creates a view', async () => {
      const response = await createViewAsApplication({
        token: authorizedApplication.accessToken,
        name: 'App Authorized View',
        objectMetadataId,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createView.id).toBeDefined();
    });

    it('creates a view group', async () => {
      const response = await createViewGroupAsApplication({
        token: authorizedApplication.accessToken,
        viewId: groupedViewId,
        fieldValue: 'NEW',
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createViewGroup.id).toBeDefined();
    });
  });

  describe('an application whose role does not grant the VIEWS permission', () => {
    it('is denied when creating a view', async () => {
      const response = await createViewAsApplication({
        token: deniedApplication.accessToken,
        name: 'App Denied View',
        objectMetadataId,
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
      expect(response.body.data?.createView).toBeFalsy();
    });

    it('is denied when creating a view group', async () => {
      const response = await createViewGroupAsApplication({
        token: deniedApplication.accessToken,
        viewId: groupedViewId,
        fieldValue: 'DONE',
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.createViewGroup).toBeFalsy();
    });
  });
});
