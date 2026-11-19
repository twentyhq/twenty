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
  type RequiredApplicationManifest,
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

const DECLARED_DEPENDENCY_APP_ID = 'd3e4f5a6-0020-4b7c-8d9e-0f1a2b3c4d5e';
const DECLARED_DEPENDENCY_ROLE_ID = 'd3e4f5a6-0021-4b7c-8d9e-0f1a2b3c4d5e';
const DECLARED_DEPENDENCY_FIELD_ID = 'd3e4f5a6-0022-4b7c-8d9e-0f1a2b3c4d5e';

const DECLARING_CONSUMER_APP_ID = 'd3e4f5a6-0030-4b7c-8d9e-0f1a2b3c4d5e';
const DECLARING_CONSUMER_ROLE_ID = 'd3e4f5a6-0031-4b7c-8d9e-0f1a2b3c4d5e';
const DECLARING_CONSUMER_VIEW_ID = 'd3e4f5a6-0032-4b7c-8d9e-0f1a2b3c4d5e';
const DECLARING_CONSUMER_VIEW_FIELD_ID = 'd3e4f5a6-0033-4b7c-8d9e-0f1a2b3c4d5e';

const NOT_INSTALLED_APP_ID = 'd3e4f5a6-0040-4b7c-8d9e-0f1a2b3c4d5e';

const DEPENDENCY_FIELD_NAME = 'crossAppLastContactedAt';
const CUSTOM_APPLICATION_VIEW_NAME = 'Cross app recently contacted people';

const dependencyPersonField: FieldManifest = {
  universalIdentifier: DEPENDENCY_FIELD_ID,
  type: FieldMetadataType.DATE_TIME,
  name: DEPENDENCY_FIELD_NAME,
  label: 'Cross App Last Contacted At',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
};

const withDisplayName = (
  manifest: Manifest,
  displayName: string,
): Manifest => ({
  ...manifest,
  application: { ...manifest.application, displayName },
});

const dependencyManifest = withDisplayName(
  buildBaseManifest({
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
  }),
  'Cross App Dependency',
);

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

const consumerManifest = withDisplayName(
  buildBaseManifest({
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
  }),
  'Cross App Consumer',
);

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

describe('Application export - undeclared field references to another application', () => {
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

  it('exports the view field and sort targeting the other application field and derives that application as required', async () => {
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
    expect(exported.manifest.application.requiredApplications).toEqual([
      { universalIdentifier: DEPENDENCY_APP_ID, versionRange: '^1.0.0' },
    ]);
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
    expect(exported.manifest.application.requiredApplications).toContainEqual({
      universalIdentifier: DEPENDENCY_APP_ID,
      versionRange: '^1.0.0',
    });

    const dryRun = await syncApplication({
      manifest: exported.manifest,
      dryRun: true,
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(dryRun.errors).toBeUndefined();
    expect(dryRun.data.syncApplication.actions).toEqual([]);
  }, 60000);

  it('removes the view fields and sorts of other applications when an application nobody declared as required is uninstalled', async () => {
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

  it('fails with a generic error to sync an undeclared reference to a field of an application that is not installed', async () => {
    const { errors } = await syncApplication({
      manifest: consumerManifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});

describe('Application sync - declared required applications', () => {
  const buildDeclaringConsumerManifest = (
    requiredApplications: RequiredApplicationManifest[],
  ): Manifest => {
    const manifest = buildBaseManifest({
      appId: DECLARING_CONSUMER_APP_ID,
      roleId: DECLARING_CONSUMER_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: DECLARING_CONSUMER_ROLE_ID,
            label: 'Cross App Declaring Consumer Role',
            description: 'Role owned by the declaring consumer application',
          },
        ],
        views: [
          {
            universalIdentifier: DECLARING_CONSUMER_VIEW_ID,
            name: 'Recently contacted people, declared',
            objectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
            type: ViewType.TABLE,
            icon: 'IconClock',
            fields: [
              {
                universalIdentifier: DECLARING_CONSUMER_VIEW_FIELD_ID,
                fieldMetadataUniversalIdentifier: DECLARED_DEPENDENCY_FIELD_ID,
                position: 0,
              },
            ],
          },
        ],
      },
    });

    return {
      ...manifest,
      application: {
        ...manifest.application,
        displayName: 'Cross App Declaring Consumer',
        requiredApplications,
      },
    };
  };

  beforeAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: DECLARING_CONSUMER_APP_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: DECLARED_DEPENDENCY_APP_ID,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: DECLARED_DEPENDENCY_APP_ID,
      name: 'Cross App Declared Dependency',
      description: 'App another application declares as required',
      sourcePath: 'cross-app-declared-dependency',
    });
    await syncApplication({
      manifest: withDisplayName(
        buildBaseManifest({
          appId: DECLARED_DEPENDENCY_APP_ID,
          roleId: DECLARED_DEPENDENCY_ROLE_ID,
          overrides: {
            roles: [
              {
                universalIdentifier: DECLARED_DEPENDENCY_ROLE_ID,
                label: 'Cross App Declared Dependency Role',
                description:
                  'Role owned by the declared dependency application',
              },
            ],
            fields: [
              {
                universalIdentifier: DECLARED_DEPENDENCY_FIELD_ID,
                type: FieldMetadataType.DATE_TIME,
                name: 'crossAppDeclaredLastContactedAt',
                label: 'Cross App Declared Last Contacted At',
                objectUniversalIdentifier:
                  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
              },
            ],
          },
        }),
        'Cross App Declared Dependency',
      ),
      expectToFail: false,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: DECLARING_CONSUMER_APP_ID,
      name: 'Cross App Declaring Consumer',
      description: 'App declaring the dependency application as required',
      sourcePath: 'cross-app-declaring-consumer',
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: DECLARING_CONSUMER_APP_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: DECLARED_DEPENDENCY_APP_ID,
    });
  });

  it('syncs when the required application is installed at a compatible version and exports the declared range', async () => {
    const { errors } = await syncApplication({
      manifest: buildDeclaringConsumerManifest([
        {
          universalIdentifier: DECLARED_DEPENDENCY_APP_ID,
          versionRange: '>=1.0.0',
        },
      ]),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const exported = await exportManifest(DECLARING_CONSUMER_APP_ID);

    expect(exported.manifest.application.requiredApplications).toEqual([
      {
        universalIdentifier: DECLARED_DEPENDENCY_APP_ID,
        versionRange: '>=1.0.0',
      },
    ]);
  }, 60000);

  it('refuses to sync when the installed version does not satisfy the declared range', async () => {
    const { errors } = await syncApplication({
      manifest: buildDeclaringConsumerManifest([
        {
          universalIdentifier: DECLARED_DEPENDENCY_APP_ID,
          versionRange: '^2.0.0',
        },
      ]),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('refuses to sync when a required application is not installed', async () => {
    const { errors } = await syncApplication({
      manifest: buildDeclaringConsumerManifest([
        {
          universalIdentifier: DECLARED_DEPENDENCY_APP_ID,
          versionRange: '>=1.0.0',
        },
        { universalIdentifier: NOT_INSTALLED_APP_ID, versionRange: '*' },
      ]),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('refuses to uninstall an application that another installed application requires', async () => {
    const { errors } = await uninstallApplication({
      universalIdentifier: DECLARED_DEPENDENCY_APP_ID,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    const exported = await exportManifest(DECLARING_CONSUMER_APP_ID);

    expect(
      exported.manifest.views.find(
        ({ universalIdentifier }) =>
          universalIdentifier === DECLARING_CONSUMER_VIEW_ID,
      )?.fields,
    ).toEqual([
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: DECLARED_DEPENDENCY_FIELD_ID,
      }),
    ]);
  }, 60000);

  it('uninstalls the required application once the application requiring it is uninstalled', async () => {
    const consumerUninstall = await uninstallApplication({
      universalIdentifier: DECLARING_CONSUMER_APP_ID,
      expectToFail: false,
    });

    expect(consumerUninstall.errors).toBeUndefined();

    const dependencyUninstall = await uninstallApplication({
      universalIdentifier: DECLARED_DEPENDENCY_APP_ID,
      expectToFail: false,
    });

    expect(dependencyUninstall.errors).toBeUndefined();
  }, 60000);
});
