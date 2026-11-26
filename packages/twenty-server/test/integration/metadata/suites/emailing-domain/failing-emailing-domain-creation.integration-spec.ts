import {
  CreateEmailIdentityCommand,
  ListTenantsCommand,
  type Tag,
} from '@aws-sdk/client-sesv2';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { type FlociSesDriver } from 'test/integration/metadata/suites/emailing-domain/types/floci-ses-driver.type';
import { createEmailingDomain } from 'test/integration/metadata/suites/emailing-domain/utils/create-emailing-domain.util';
import { findSesIdentityTenantNames } from 'test/integration/metadata/suites/emailing-domain/utils/find-ses-identity-tenant-names.util';
import { switchToFlociSesDriver } from 'test/integration/metadata/suites/emailing-domain/utils/switch-to-floci-ses-driver.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { AWS_SES_RESOURCE_NAME_PREFIX } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-resource-name-prefix.constant';
import { AWS_SES_TENANT_TAG_KEY } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-tenant-tag-key.constant';

type TestContext = {
  domain: string;
  existingIdentityTags?: Tag[];
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when the SES identity carries no tenant tag',
    context: {
      domain: 'untagged-identity.example.com',
    },
  },
  {
    title: 'when the SES identity was created for another workspace',
    context: {
      domain: 'other-workspace-identity.example.com',
      existingIdentityTags: [
        {
          Key: AWS_SES_TENANT_TAG_KEY,
          Value: `${AWS_SES_RESOURCE_NAME_PREFIX}-6f1d5a2e-8c3b-4e9a-9d7f-2b4c6e8a0f13`,
        },
      ],
    },
  },
];

const countEmailingDomains = async (domain: string) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM core."emailingDomain" WHERE domain = $1`,
    [domain],
  );

  return count;
};

describe('Emailing domain creation should fail', () => {
  let flociSesDriver: FlociSesDriver;

  beforeAll(async () => {
    flociSesDriver = await switchToFlociSesDriver();
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

      const { errors } = await createEmailingDomain({
        expectToFail: true,
        input: { domain },
      });

      const { Tenants } = await sesClient.send(new ListTenantsCommand({}));

      expectOneNotInternalServerErrorSnapshot({ errors });
      expect(await countEmailingDomains(domain)).toBe(0);
      expect(Tenants ?? []).toEqual([]);
      expect(await findSesIdentityTenantNames({ sesClient, domain })).toEqual(
        [],
      );
    },
  );
});
