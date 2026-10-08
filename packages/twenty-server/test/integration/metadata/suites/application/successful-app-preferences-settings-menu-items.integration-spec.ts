import { decodeJwtCompleteOrThrow } from 'test/integration/graphql/utils/decode-jwt-complete-or-throw.util';
import { updateWorkspaceMemberSettings } from 'test/integration/graphql/suites/application-role-intersection/utils/update-workspace-member-settings.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { myAppPreferencesApplications } from 'test/integration/metadata/suites/application/utils/my-app-preferences-applications.util';
import { myAppPreferencesSettingsMenuItems } from 'test/integration/metadata/suites/application/utils/my-app-preferences-settings-menu-items.util';
import { setupAppPreferencesSettingsApplication } from 'test/integration/metadata/suites/application/utils/setup-app-preferences-settings-application.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findFrontComponent } from 'test/integration/metadata/suites/front-component/utils/find-front-component.util';
import { generateFrontComponentApplicationTokenPair } from 'test/integration/metadata/suites/front-component/utils/generate-front-component-application-token-pair.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Personal application settings menu items should succeed', () => {
  let customApplication: Awaited<
    ReturnType<typeof setupAppPreferencesSettingsApplication>
  >;
  let combinedApplication: typeof customApplication;
  let workspaceApplication: typeof customApplication;
  let originalMemberRoleId: string;
  let restrictedMemberRoleId: string;

  beforeAll(async () => {
    customApplication = await setupAppPreferencesSettingsApplication({
      name: 'Personal Custom Settings',
    });
    combinedApplication = await setupAppPreferencesSettingsApplication({
      name: 'Personal Combined Settings',
      withOtherCapabilities: true,
    });
    workspaceApplication = await setupAppPreferencesSettingsApplication({
      name: 'Workspace Custom Settings',
      scope: 'WORKSPACE',
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: true,
      expectToFail: false,
    });
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    const { data: roleData, errors: roleErrors } = await createOneRole({
      input: {
        label: `Personal Settings Member ${uuidv4()}`,
        canUpdateAllSettings: false,
        canReadAllObjectRecords: true,
        canBeAssignedToUsers: true,
      },
    });

    expect(roleErrors).toBeUndefined();

    restrictedMemberRoleId = roleData.createOneRole.id;
    const { errors: assignmentErrors } = await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: restrictedMemberRoleId,
      },
    });

    expect(assignmentErrors).toBeUndefined();
  }, 180000);

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: originalMemberRoleId,
      },
    });
    await deleteOneRole({ input: { idToDelete: restrictedMemberRoleId } });
    for (const application of [
      customApplication,
      combinedApplication,
      workspaceApplication,
    ]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: false,
      expectToFail: false,
    });
  }, 120000);

  it('allows an ordinary member while administration stays protected', async () => {
    const { permissionFlags } =
      await getAppProviderByClassName<PermissionsService>(
        'PermissionsService',
      ).getUserWorkspacePermissions({
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });
    const { errors: administrationErrors } = await findOneApplication({
      input: { universalIdentifier: customApplication.universalIdentifier },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });
    const { data, errors } = await myAppPreferencesSettingsMenuItems({
      input: {
        applicationUniversalIdentifier: customApplication.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(permissionFlags[PermissionFlagType.APPLICATIONS]).toBe(false);
    expect(permissionFlags[PermissionFlagType.CONNECTED_ACCOUNTS]).toBe(false);
    expect(administrationErrors).toHaveLength(1);
    expect(administrationErrors[0].extensions.code).toBe('FORBIDDEN');
    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesSettingsMenuItems).toHaveLength(2);
  });

  it('includes custom-only apps once and excludes workspace-only menus', async () => {
    const { data, errors } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesApplications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: customApplication.id,
          hasConnectionProviders: false,
        }),
        expect.objectContaining({
          id: combinedApplication.id,
          hasConnectionProviders: true,
        }),
      ]),
    );
    expect(
      data.myAppPreferencesApplications.filter(
        ({ id }) => id === customApplication.id,
      ),
    ).toHaveLength(1);
    expect(
      data.myAppPreferencesApplications.filter(
        ({ id }) => id === combinedApplication.id,
      ),
    ).toHaveLength(1);
    expect(data.myAppPreferencesApplications.map(({ id }) => id)).not.toContain(
      workspaceApplication.id,
    );
  });

  it('returns only USER declarations in position order with exact public fields', async () => {
    const { data, errors } = await myAppPreferencesSettingsMenuItems({
      input: {
        applicationUniversalIdentifier: customApplication.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const expectedMenuItems = customApplication.settingsMenuItems
      .filter(({ scope }) => scope === 'USER')
      .sort((menuItemA, menuItemB) => menuItemA.position - menuItemB.position)
      .map(
        ({
          id,
          universalIdentifier,
          title,
          icon,
          position,
          frontComponentId,
        }) => ({
          id,
          universalIdentifier,
          title,
          icon,
          position,
          frontComponentId,
        }),
      );

    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesSettingsMenuItems).toEqual(expectedMenuItems);
    expect(
      data.myAppPreferencesSettingsMenuItems.map(({ title }) => title),
    ).toEqual(['Profile', 'Recording']);
    expect(data.myAppPreferencesSettingsMenuItems[0].icon).toBeNull();
  });

  it('translates titles using the installed application catalog and preserves fallback titles', async () => {
    const { errors: updateErrors } = await updateWorkspaceMemberSettings({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        update: { locale: 'fr-FR' },
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(updateErrors).toBeUndefined();

    try {
      const { data, errors } = await myAppPreferencesSettingsMenuItems({
        input: {
          applicationUniversalIdentifier: customApplication.universalIdentifier,
        },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(errors).toBeUndefined();
      expect(
        data.myAppPreferencesSettingsMenuItems.map(({ title }) => title),
      ).toEqual(['Profil personnel', 'Recording']);
    } finally {
      await updateWorkspaceMemberSettings({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          update: { locale: 'en' },
        },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
    }
  });

  it('returns no custom preference tabs for WORKSPACE declarations', async () => {
    const { data, errors } = await myAppPreferencesSettingsMenuItems({
      input: {
        applicationUniversalIdentifier:
          workspaceApplication.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesSettingsMenuItems).toEqual([]);
  });

  it('loads a declared component and its bundle with a member-bound runtime token', async () => {
    const settingsMenuItem = customApplication.settingsMenuItems.find(
      ({ title }) => title === 'Profile',
    );

    jestExpectToBeDefined(settingsMenuItem);

    const { data: componentData, errors: componentErrors } =
      await findFrontComponent({
        input: { id: settingsMenuItem.frontComponentId },
        gqlFields: 'id applicationId name',
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
    const { data: tokenData, errors: tokenErrors } =
      await generateFrontComponentApplicationTokenPair({
        input: { applicationId: customApplication.id },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
    const applicationToken =
      tokenData.generateFrontComponentApplicationTokenPair
        .applicationAccessToken.token;

    expect(componentErrors).toBeUndefined();
    expect(componentData.frontComponent).toEqual({
      id: settingsMenuItem.frontComponentId,
      applicationId: customApplication.id,
      name: 'Profile Settings',
    });
    expect(tokenErrors).toBeUndefined();
    expect(decodeJwtCompleteOrThrow(applicationToken).payload).toMatchObject({
      applicationId: customApplication.id,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userId: USER_DATA_SEED_IDS.JONY,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      type: JwtTokenTypeEnum.APPLICATION_ACCESS,
    });
    await makeRestApiRequest({
      method: 'get',
      path: `/front-components/${settingsMenuItem.frontComponentId}`,
      bearer: applicationToken,
    })
      .expect(200)
      .expect('Content-Type', /application\/javascript/)
      .expect((response) => {
        expect(response.text).toBe('export default function Settings() {}');
      });
  });

  it('keeps installed custom settings available during an upgrade', async () => {
    await globalThis.testDataSource.query(
      `UPDATE core."application" SET state = $1 WHERE id = $2`,
      [ApplicationState.UPGRADING, customApplication.id],
    );

    try {
      const { data: applicationData } = await myAppPreferencesApplications({
        input: {},
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const { data, errors } = await myAppPreferencesSettingsMenuItems({
        input: {
          applicationUniversalIdentifier: customApplication.universalIdentifier,
        },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(
        applicationData.myAppPreferencesApplications.map(({ id }) => id),
      ).toContain(customApplication.id);
      expect(errors).toBeUndefined();
      expect(data.myAppPreferencesSettingsMenuItems).toHaveLength(2);
    } finally {
      await globalThis.testDataSource.query(
        `UPDATE core."application" SET state = $1 WHERE id = $2`,
        [ApplicationState.INSTALLED, customApplication.id],
      );
    }
  });

  it('removes custom-only discovery when the application removes its USER declarations', async () => {
    const { errors: syncErrors } = await syncApplication({
      manifest: {
        ...customApplication.manifest,
        settingsMenuItems: customApplication.manifest.settingsMenuItems.filter(
          ({ scope }) => scope === 'WORKSPACE',
        ),
      },
      inferDeletionFromMissingEntities: true,
    });
    const { data, errors } = await myAppPreferencesSettingsMenuItems({
      input: {
        applicationUniversalIdentifier: customApplication.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const { data: applicationData } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(syncErrors).toBeUndefined();
    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesSettingsMenuItems).toEqual([]);
    expect(
      applicationData.myAppPreferencesApplications.map(({ id }) => id),
    ).not.toContain(customApplication.id);
  });
});
