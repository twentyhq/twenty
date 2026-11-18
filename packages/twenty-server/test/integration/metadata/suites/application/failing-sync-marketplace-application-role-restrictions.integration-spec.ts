import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type LegacyCompliantRoleManifest,
  type Manifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

jest.setTimeout(120000);

const COMPANY = STANDARD_OBJECTS.company;

type RoleRestrictions = Omit<
  LegacyCompliantRoleManifest,
  'universalIdentifier' | 'label'
>;

const RESTRICTIONS_BY_FORMAT: {
  title: string;
  restrictions: RoleRestrictions;
  declared: RegExp;
}[] = [
  {
    title: 'legacy row-level predicates',
    restrictions: {
      objectPermissions: [
        {
          objectUniversalIdentifier: COMPANY.universalIdentifier,
          canReadObjectRecords: true,
        },
      ],
      rowLevelPermissionPredicates: [
        {
          universalIdentifier: uuidv4(),
          objectUniversalIdentifier: COMPANY.universalIdentifier,
          fieldUniversalIdentifier: COMPANY.fields.name.universalIdentifier,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value: 'Acme',
        },
      ],
    },
    declared: /declares row-level rules/,
  },
  {
    title: 'legacy field permissions',
    restrictions: {
      fieldPermissions: [
        {
          objectUniversalIdentifier: COMPANY.universalIdentifier,
          fieldUniversalIdentifier: COMPANY.fields.name.universalIdentifier,
          canUpdateFieldValue: false,
        },
      ],
    },
    declared: /declares field permissions/,
  },
  {
    title: 'row-level rules in recordsPermissions',
    restrictions: {
      recordsPermissions: {
        objects: [
          {
            objectUniversalIdentifier: COMPANY.universalIdentifier,
            rowLevelRecordsPermissions: [
              {
                universalIdentifier: uuidv4(),
                canReadRecords: true,
                predicates: [
                  {
                    universalIdentifier: uuidv4(),
                    fieldUniversalIdentifier:
                      COMPANY.fields.name.universalIdentifier,
                    operand: RowLevelPermissionPredicateOperand.CONTAINS,
                    value: 'Acme',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    declared: /declares row-level rules/,
  },
  {
    title: 'field permissions in recordsPermissions',
    restrictions: {
      recordsPermissions: {
        objects: [
          {
            objectUniversalIdentifier: COMPANY.universalIdentifier,
            canReadAllRecords: true,
            unreadableFields: [COMPANY.fields.name.universalIdentifier],
          },
        ],
      },
    },
    declared: /declares field permissions/,
  },
];

const buildRestrictedManifest = ({
  appId,
  roleId,
  restrictions,
  isAgentRole = false,
}: {
  appId: string;
  roleId: string;
  restrictions: RoleRestrictions;
  isAgentRole?: boolean;
}): Manifest => {
  const requestedRoleId = isAgentRole ? uuidv4() : roleId;

  return buildBaseManifest({
    appId,
    roleId: requestedRoleId,
    overrides: {
      roles: [
        ...(isAgentRole
          ? [{ universalIdentifier: requestedRoleId, label: 'Requested' }]
          : []),
        {
          universalIdentifier: roleId,
          label: 'Restricted',
          canBeAssignedToAgents: true,
          ...restrictions,
        },
      ],
      agents: isAgentRole
        ? [
            {
              universalIdentifier: uuidv4(),
              name: 'restricted-agent',
              label: 'Restricted agent',
              prompt: 'You are a test agent.',
              roleUniversalIdentifier: roleId,
            },
          ]
        : [],
    },
  });
};

const countRows = async (table: string, universalIdentifier: string) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT count(*)::int AS count FROM core."${table}"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return count;
};

describe('Marketplace application roles cannot declare row-level rules or field permissions', () => {
  describe('on dev sync of a LOCAL application', () => {
    let appId: string;

    beforeEach(async () => {
      appId = uuidv4();
      await setupApplicationForSync({
        applicationUniversalIdentifier: appId,
        name: 'Restricted role application',
        description: 'Application declaring restricted roles',
        sourcePath: 'test-marketplace-application-role-restrictions',
      });
    }, 60000);

    afterEach(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: appId,
      });
    });

    describe.each(RESTRICTIONS_BY_FORMAT)(
      'with $title',
      ({ restrictions, declared }) => {
        it.each([
          { roleKind: 'application', isAgentRole: false },
          { roleKind: 'agent', isAgentRole: true },
        ])(
          'refuses them on the $roleKind role and writes nothing',
          async ({ roleKind, isAgentRole }) => {
            const roleId = uuidv4();

            const { errors } = await syncApplication({
              manifest: buildRestrictedManifest({
                appId,
                roleId,
                restrictions,
                isAgentRole,
              }),
              expectToFail: true,
            });

            expect(errors?.[0]?.message).toMatch(declared);
            expect(errors?.[0]?.message).toContain(`the ${roleKind} role`);
            expect(await countRows('role', roleId)).toBe(0);
          },
        );
      },
    );

    it('refuses them on a dry run too', async () => {
      const { errors } = await syncApplication({
        manifest: buildRestrictedManifest({
          appId,
          roleId: uuidv4(),
          restrictions: RESTRICTIONS_BY_FORMAT[1].restrictions,
        }),
        dryRun: true,
        expectToFail: true,
      });

      expect(errors?.[0]?.message).toMatch(/declares field permissions/);
    });
  });

  describe('on install of a tarball application', () => {
    let appId: string;

    beforeEach(() => {
      appId = uuidv4();
    });

    afterEach(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: appId,
      });
    });

    it.each(RESTRICTIONS_BY_FORMAT)(
      'refuses $title before installing anything',
      async ({ restrictions, declared }) => {
        const roleId = uuidv4();
        const tarball = await createAppTarball({
          'manifest.json': JSON.stringify(
            buildRestrictedManifest({ appId, roleId, restrictions }),
          ),
          'package.json': JSON.stringify({
            name: `test-role-restrictions-${appId}`,
            version: '1.0.0',
          }),
        });

        const uploadResult = await uploadAppTarball({
          tarballBuffer: tarball,
          universalIdentifier: appId,
        });

        expect(uploadResult.errors).toBeUndefined();

        const { errors } = await installApplication({
          input: { universalIdentifier: appId },
          expectToFail: true,
        });

        expect(JSON.stringify(errors)).toMatch(declared);
        expect(await countRows('application', appId)).toBe(0);
        expect(await countRows('role', roleId)).toBe(0);
      },
    );
  });

  it('lets the workspace custom application declare them', async () => {
    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });
    const customApplication = applicationsData.findManyApplications.find(
      ({ name }) => name === WORKSPACE_CUSTOM_APPLICATION_NAME,
    );

    jestExpectToBeDefined(customApplication);

    for (const { restrictions } of RESTRICTIONS_BY_FORMAT) {
      const { errors } = await syncApplication({
        manifest: buildBaseManifest({
          appId: customApplication.universalIdentifier,
          roleId: STANDARD_ROLE.admin.universalIdentifier,
          overrides: {
            roles: [
              {
                universalIdentifier: uuidv4(),
                label: 'Custom role with restrictions',
                ...restrictions,
              },
            ],
          },
        }),
        dryRun: true,
        inferDeletionFromMissingEntities: false,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
    }
  });
});
