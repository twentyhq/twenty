import { randomUUID } from 'crypto';

import { claimApplicationRegistrationOwnership } from 'test/integration/metadata/suites/application-registration/utils/claim-application-registration-ownership.util';
import { transferApplicationRegistrationOwnership } from 'test/integration/metadata/suites/application-registration/utils/transfer-application-registration-ownership.util';
import { insertCatalogApplicationRegistration } from 'test/integration/metadata/suites/application/utils/insert-catalog-application-registration.util';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('Application registration ownership change with a user session', () => {
  let targetRegistrationUniversalIdentifier: string;

  beforeEach(() => {
    targetRegistrationUniversalIdentifier = randomUUID();
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
      [targetRegistrationUniversalIdentifier],
    );
  });

  it('should transfer a registration to another workspace', async () => {
    const applicationRegistrationId =
      await insertCatalogApplicationRegistration({
        universalIdentifier: targetRegistrationUniversalIdentifier,
        name: 'Ownership Change Target',
        sourcePackage: `ownership-change-target-${targetRegistrationUniversalIdentifier}`,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });

    const { data } = await transferApplicationRegistrationOwnership({
      input: {
        applicationRegistrationId,
        targetWorkspaceSubdomain: 'yc',
      },
      expectToFail: false,
    });

    expect(data.transferApplicationRegistrationOwnership).toEqual({
      id: applicationRegistrationId,
      ownerWorkspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
    });
  });

  it('should claim a registration owned by no workspace', async () => {
    const applicationRegistrationId =
      await insertCatalogApplicationRegistration({
        universalIdentifier: targetRegistrationUniversalIdentifier,
        name: 'Ownership Change Target',
        sourcePackage: `ownership-change-target-${targetRegistrationUniversalIdentifier}`,
        workspaceId: null,
      });

    const { data } = await claimApplicationRegistrationOwnership({
      input: { applicationRegistrationId },
      expectToFail: false,
    });

    expect(data.claimApplicationRegistrationOwnership).toEqual({
      id: applicationRegistrationId,
      ownerWorkspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  });
});
