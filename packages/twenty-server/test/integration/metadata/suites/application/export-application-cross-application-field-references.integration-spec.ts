import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type FieldManifest,
  type Manifest,
  type ViewManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  ViewSortDirection,
  ViewType,
} from 'twenty-shared/types';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

const DEPENDENCY_APP_ID = 'd3e4f5a6-0000-4b7c-8d9e-0f1a2b3c4d5e';
const DEPENDENCY_ROLE_ID = 'd3e4f5a6-0001-4b7c-8d9e-0f1a2b3c4d5e';
const DEPENDENCY_FIELD_ID = 'd3e4f5a6-0002-4b7c-8d9e-0f1a2b3c4d5e';

const CONSUMER_APP_ID = 'd3e4f5a6-0010-4b7c-8d9e-0f1a2b3c4d5e';
const CONSUMER_ROLE_ID = 'd3e4f5a6-0011-4b7c-8d9e-0f1a2b3c4d5e';
const CONSUMER_VIEW_ID = 'd3e4f5a6-0012-4b7c-8d9e-0f1a2b3c4d5e';
const CONSUMER_VIEW_FIELD_ID = 'd3e4f5a6-0013-4b7c-8d9e-0f1a2b3c4d5e';
const CONSUMER_VIEW_SORT_ID = 'd3e4f5a6-0014-4b7c-8d9e-0f1a2b3c4d5e';

const DEPENDENCY_FIELD_NAME = 'crossAppLastContactedAt';
const CUSTOM_APPLICATION_VIEW_NAME = 'Cross app recently contacted people';

const dependencyPersonField: FieldManifest = {
  universalIdentifier: DEPENDENCY_FIELD_ID,
  type: FieldMetadataType.DATE_TIME,
  name: DEPENDENCY_FIELD_NAME,
  label: 'Cross App Last Contacted At',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
};

const dependencyManifest = buildBaseManifest({
  appId: DEPENDENCY_APP_ID,
  roleId: DEPENDENCY_ROLE_ID,
  overrides: {
    roles: [
      {
        universalIdentifier: DEPENDENCY_ROLE_ID,
        label: 'Cross App Dependency Role',
        description: 'Role owned by the dependency application',
      },
    ],
    fields: [dependencyPersonField],
  },
});

const consumerView: ViewManifest = {
  universalIdentifier: CONSUMER_VIEW_ID,
  name: 'Recently contacted people',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
  type: ViewType.TABLE,
  icon: 'IconClock',
  fields: [
    {
      universalIdentifier: CONSUMER_VIEW_FIELD_ID,
      fieldMetadataUniversalIdentifier: DEPENDENCY_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 180,
    },
  ],
  sorts: [
    {
      universalIdentifier: CONSUMER_VIEW_SORT_ID,
      fieldMetadataUniversalIdentifier: DEPENDENCY_FIELD_ID,
      direction: ViewSortDirection.DESC,
    },
  ],
};

const consumerManifest: Manifest = buildBaseManifest({
  appId: CONSUMER_APP_ID,
  roleId: CONSUMER_ROLE_ID,
  overrides: {
    roles: [
      {
        universalIdentifier: CONSUMER_ROLE_ID,
        label: 'Cross App Consumer Role',
        description: 'Role owned by the consumer application',
      },
    ],
    views: [consumerView],
  },
});

const findCustomApplicationUniversalIdentifier = async () => {
  const { data } = await findManyApplications({ expectToFail: false });
  const customApplication = data.findManyApplications.find(
    ({ name }) => name === WORKSPACE_CUSTOM_APPLICATION_NAME,
  );

  jestExpectToBeDefined(customApplication);

  return customApplication.universalIdentifier;
};

const findPersonObjectAndDependencyField = async () => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: { filter: {}, paging: { first: 1000 } },
    gqlFields: `
      id
      nameSingular
      fieldsList {
        id
        name
      }
    `,
  });
  const personObject = objects.find(
    ({ nameSingular }) => nameSingular === 'person',
  );

  jestExpectToBeDefined(personObject);

  return {
    personObject,
    dependencyField: personObject.fieldsList?.find(
      ({ name }) => name === DEPENDENCY_FIELD_NAME,
    ),
  };
};

const exportManifest = async (universalIdentifier: string) => {
  const { data, errors } = await exportApplication({
    universalIdentifier,
    expectToFail: false,
  });

  expect(errors).toBeUndefined();

  return data.exportApplication;
};

describe('Application export - field references to another application', () => {
  let customApplicationViewId: string | undefined;

  beforeAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: CONSUMER_APP_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: DEPENDENCY_APP_ID,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: DEPENDENCY_APP_ID,
      name: 'Cross App Dependency',
      description: 'App owning a field on the standard Person object',
      sourcePath: 'cross-app-dependency',
    });
    await syncApplication({
      manifest: dependencyManifest,
      expectToFail: false,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: CONSUMER_APP_ID,
      name: 'Cross App Consumer',
      description: 'App whose view shows the dependency application field',
      sourcePath: 'cross-app-consumer',
    });
    await syncApplication({ manifest: consumerManifest, expectToFail: false });
  }, 120000);

  afterAll(async () => {
    if (customApplicationViewId !== undefined) {
      await destroyOneView({
        expectToFail: false,
        viewId: customApplicationViewId,
      });
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: CONSUMER_APP_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: DEPENDENCY_APP_ID,
    });
  });

  it('exports the view field and sort targeting the other application field, without declaring that application', async () => {
    const exported = await exportManifest(CONSUMER_APP_ID);

    const exportedView = exported.manifest.views.find(
      ({ universalIdentifier }) => universalIdentifier === CONSUMER_VIEW_ID,
    );

    jestExpectToBeDefined(exportedView);
    expect(exportedView.fields).toEqual([
      expect.objectContaining({
        universalIdentifier: CONSUMER_VIEW_FIELD_ID,
        fieldMetadataUniversalIdentifier: DEPENDENCY_FIELD_ID,
      }),
    ]);
    expect(exportedView.sorts).toEqual([
      expect.objectContaining({
        universalIdentifier: CONSUMER_VIEW_SORT_ID,
        fieldMetadataUniversalIdentifier: DEPENDENCY_FIELD_ID,
      }),
    ]);

    const statusOf = (universalIdentifier: string) =>
      exported.coverage.find(
        (entry) => entry.universalIdentifier === universalIdentifier,
      )?.status;

    expect(statusOf(CONSUMER_VIEW_FIELD_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(CONSUMER_VIEW_SORT_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(DEPENDENCY_FIELD_ID)).toBeUndefined();
    expect(
      exported.manifest.fields.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).not.toContain(DEPENDENCY_FIELD_ID);
    expect(JSON.stringify(exported.manifest.application)).not.toContain(
      DEPENDENCY_APP_ID,
    );
  }, 60000);

  it('round-trips the export through an additive dry-run sync without any action', async () => {
    const exported = await exportManifest(CONSUMER_APP_ID);

    const dryRun = await syncApplication({
      manifest: exported.manifest,
      dryRun: true,
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(dryRun.errors).toBeUndefined();
    expect(dryRun.data.syncApplication.actions).toEqual([]);
  }, 60000);

  it('exports a view field created through the metadata API in the workspace custom application on the other application field', async () => {
    const { personObject, dependencyField } =
      await findPersonObjectAndDependencyField();

    jestExpectToBeDefined(dependencyField);

    const { data: createdViewData } = await createOneView({
      expectToFail: false,
      input: {
        name: CUSTOM_APPLICATION_VIEW_NAME,
        objectMetadataId: personObject.id,
        type: ViewType.TABLE,
        icon: 'IconUser',
      },
    });

    customApplicationViewId = createdViewData.createView.id;

    await createOneViewField({
      expectToFail: false,
      input: {
        viewId: customApplicationViewId,
        fieldMetadataId: dependencyField.id,
        position: 0,
      },
    });

    const customApplicationUniversalIdentifier =
      await findCustomApplicationUniversalIdentifier();
    const exported = await exportManifest(customApplicationUniversalIdentifier);

    const exportedView = exported.manifest.views.find(
      ({ name }) => name === CUSTOM_APPLICATION_VIEW_NAME,
    );

    jestExpectToBeDefined(exportedView);
    expect(exportedView.fields).toContainEqual(
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: DEPENDENCY_FIELD_ID,
      }),
    );
    expect(JSON.stringify(exported.manifest.application)).not.toContain(
      DEPENDENCY_APP_ID,
    );

    const dryRun = await syncApplication({
      manifest: exported.manifest,
      dryRun: true,
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(dryRun.errors).toBeUndefined();
    expect(dryRun.data.syncApplication.actions).toEqual([]);
  }, 60000);

  it('removes the view fields and sorts of other applications when the referenced application is uninstalled', async () => {
    const { errors } = await uninstallApplication({
      universalIdentifier: DEPENDENCY_APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const { dependencyField } = await findPersonObjectAndDependencyField();

    expect(dependencyField).toBeUndefined();

    const consumerExport = await exportManifest(CONSUMER_APP_ID);
    const consumerExportedView = consumerExport.manifest.views.find(
      ({ universalIdentifier }) => universalIdentifier === CONSUMER_VIEW_ID,
    );

    jestExpectToBeDefined(consumerExportedView);
    expect(consumerExportedView.fields ?? []).toEqual([]);
    expect(consumerExportedView.sorts ?? []).toEqual([]);

    const customApplicationExport = await exportManifest(
      await findCustomApplicationUniversalIdentifier(),
    );
    const customApplicationExportedView =
      customApplicationExport.manifest.views.find(
        ({ name }) => name === CUSTOM_APPLICATION_VIEW_NAME,
      );

    jestExpectToBeDefined(customApplicationExportedView);
    expect(customApplicationExportedView.fields ?? []).not.toContainEqual(
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: DEPENDENCY_FIELD_ID,
      }),
    );
  }, 60000);

  it('fails to sync a manifest that references a field of an application that is not installed', async () => {
    const { errors } = await syncApplication({
      manifest: consumerManifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
