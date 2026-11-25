import {
  CreateEmailIdentityCommand,
  CreateTenantCommand,
  type Tag,
} from '@aws-sdk/client-sesv2';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { type FlociSesDriver } from 'test/integration/metadata/suites/emailing-domain/types/floci-ses-driver.type';
import { findSesIdentityTenantNames } from 'test/integration/metadata/suites/emailing-domain/utils/find-ses-identity-tenant-names.util';
import { switchToFlociSesDriver } from 'test/integration/metadata/suites/emailing-domain/utils/switch-to-floci-ses-driver.util';
import { verifyEmailingDomain } from 'test/integration/metadata/suites/emailing-domain/utils/verify-emailing-domain.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { AWS_SES_RESOURCE_NAME_PREFIX } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-resource-name-prefix.constant';
import { AWS_SES_TENANT_TAG_KEY } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-tenant-tag-key.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type TestContext = {
  domain: string;
  existingIdentityTags?: Tag[];
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when the SES identity carries no tenant tag',
    context: {
      domain: 'untagged-identity-reverification.example.com',
    },
  },
  {
    title: 'when the SES identity was created for another workspace',
    context: {
      domain: 'other-workspace-identity-reverification.example.com',
      existingIdentityTags: [
        {
          Key: AWS_SES_TENANT_TAG_KEY,
          Value: `${AWS_SES_RESOURCE_NAME_PREFIX}-6f1d5a2e-8c3b-4e9a-9d7f-2b4c6e8a0f13`,
        },
      ],
    },
  },
];

const APPLE_TENANT_NAME = `${AWS_SES_RESOURCE_NAME_PREFIX}-${SEED_APPLE_WORKSPACE_ID}`;

const insertPendingEmailingDomain = async (domain: string): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `INSERT INTO core."emailingDomain" ("workspaceId", "domain", "status")
     VALUES ($1, $2, 'PENDING') RETURNING id`,
    [SEED_APPLE_WORKSPACE_ID, domain],
  );

  return id;
};

describe('Emailing domain verification should fail', () => {
  let flociSesDriver: FlociSesDriver;

  beforeAll(async () => {
    flociSesDriver = await switchToFlociSesDriver();

    await flociSesDriver.sesClient.send(
      new CreateTenantCommand({ TenantName: APPLE_TENANT_NAME }),
    );
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."emailingDomain" WHERE domain = ANY($1)`,
      [FAILING_TEST_CASES.map(({ context: { domain } }) => domain)],
    );
  });

  afterAll(async () => {
    await flociSesDriver?.restore();
  });

  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context: { domain, existingIdentityTags } }) => {
      const { sesClient } = flociSesDriver;

      await sesClient.send(
        new CreateEmailIdentityCommand({
          EmailIdentity: domain,
          Tags: existingIdentityTags,
        }),
      );

      const emailingDomainId = await insertPendingEmailingDomain(domain);

      const { errors } = await verifyEmailingDomain({
        expectToFail: true,
        input: { id: emailingDomainId },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
      expect(await findSesIdentityTenantNames({ sesClient, domain })).toEqual(
        [],
      );
    },
  );
});
