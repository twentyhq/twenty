import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import {
  getMarketplaceApplicationRoleAssignabilityErrors,
  getMarketplaceApplicationRoleRestrictionErrors,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-marketplace-application-role-errors.util';

const APPLICATION_ID = 'application-id';
const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';

const buildOptionsFor = ({
  universalIdentifier = 'application',
  sourceType = ApplicationRegistrationSourceType.NPM,
  isSystemBuild = false,
}: {
  universalIdentifier?: string;
  sourceType?: ApplicationRegistrationSourceType;
  isSystemBuild?: boolean;
} = {}): WorkspaceMigrationValidationBuildOptions => ({
  isSystemBuild,
  applicationUniversalIdentifier: universalIdentifier,
  workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
  flatApplicationMaps: {
    byId: {
      [APPLICATION_ID]: {
        id: APPLICATION_ID,
        universalIdentifier,
        sourceType,
      } as FlatApplication,
    },
    idByUniversalIdentifier: { [universalIdentifier]: APPLICATION_ID },
  },
});

const AGENT_ONLY_ROLE = {
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
};

describe('getMarketplaceApplicationRoleAssignabilityErrors', () => {
  it.each([
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.LOCAL,
  ])('accepts an agent-only role of a %s application', (sourceType) => {
    expect(
      getMarketplaceApplicationRoleAssignabilityErrors({
        flatRole: AGENT_ONLY_ROLE,
        buildOptions: buildOptionsFor({ sourceType }),
      }),
    ).toEqual([]);
  });

  it.each([
    { canBeAssignedToUsers: true, canBeAssignedToApiKeys: false },
    { canBeAssignedToUsers: false, canBeAssignedToApiKeys: true },
  ])(
    'refuses a marketplace application role assignable to users or API keys %o',
    (flatRole) => {
      expect(
        getMarketplaceApplicationRoleAssignabilityErrors({
          flatRole,
          buildOptions: buildOptionsFor(),
        }),
      ).toEqual([
        expect.objectContaining({
          code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_ROLE_ASSIGNABILITY,
        }),
      ]);
    },
  );

  it.each([
    {
      title: 'the workspace custom application',
      universalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    },
    {
      title: 'twenty-standard',
      universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    },
    {
      title: 'an OAuth-only application',
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    },
    { title: 'a system build', isSystemBuild: true },
  ])('accepts a role assignable to users for $title', (options) => {
    expect(
      getMarketplaceApplicationRoleAssignabilityErrors({
        flatRole: { canBeAssignedToUsers: true, canBeAssignedToApiKeys: true },
        buildOptions: buildOptionsFor(options),
      }),
    ).toEqual([]);
  });
});

describe('getMarketplaceApplicationRoleRestrictionErrors', () => {
  it('refuses any row-level rule or field permission on a marketplace application', () => {
    expect(
      getMarketplaceApplicationRoleRestrictionErrors({
        buildOptions: buildOptionsFor(),
      }),
    ).toEqual([
      expect.objectContaining({
        code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_ROLE_RESTRICTION,
      }),
    ]);
  });

  it('accepts them on the workspace custom application', () => {
    expect(
      getMarketplaceApplicationRoleRestrictionErrors({
        buildOptions: buildOptionsFor({
          universalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
        }),
      }),
    ).toEqual([]);
  });
});
