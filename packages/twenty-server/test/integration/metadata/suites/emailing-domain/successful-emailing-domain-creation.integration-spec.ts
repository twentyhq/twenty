import {
  CreateEmailIdentityCommand,
  GetEmailIdentityCommand,
} from '@aws-sdk/client-sesv2';
import { type FlociSesDriver } from 'test/integration/metadata/suites/emailing-domain/types/floci-ses-driver.type';
import { createEmailingDomain } from 'test/integration/metadata/suites/emailing-domain/utils/create-emailing-domain.util';
import { findSesIdentityTenantNames } from 'test/integration/metadata/suites/emailing-domain/utils/find-ses-identity-tenant-names.util';
import { switchToFlociSesDriver } from 'test/integration/metadata/suites/emailing-domain/utils/switch-to-floci-ses-driver.util';

import { AWS_SES_RESOURCE_NAME_PREFIX } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-resource-name-prefix.constant';
import { AWS_SES_TENANT_TAG_KEY } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-tenant-tag-key.constant';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const NEW_DOMAIN = 'new-identity.example.com';
const OWN_DOMAIN = 'own-identity.example.com';
const APPLE_TENANT_NAME = `${AWS_SES_RESOURCE_NAME_PREFIX}-${SEED_APPLE_WORKSPACE_ID}`;

describe('Emailing domain creation should succeed', () => {
  let flociSesDriver: FlociSesDriver;

  beforeAll(async () => {
    flociSesDriver = await switchToFlociSesDriver();
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."emailingDomain" WHERE domain = ANY($1)`,
      [[NEW_DOMAIN, OWN_DOMAIN]],
    );
  });

  afterAll(async () => {
    await flociSesDriver?.restore();
  });

  it('for a domain with no SES identity', async () => {
    const { sesClient } = flociSesDriver;

    const { data } = await createEmailingDomain({
      expectToFail: false,
      input: { domain: NEW_DOMAIN },
    });

    const identity = await sesClient.send(
      new GetEmailIdentityCommand({ EmailIdentity: NEW_DOMAIN }),
    );

    expect(data.createEmailingDomain).toMatchObject({
      domain: NEW_DOMAIN,
      status: EmailingDomainStatus.PENDING,
    });
    expect(identity.Tags).toContainEqual({
      Key: AWS_SES_TENANT_TAG_KEY,
      Value: APPLE_TENANT_NAME,
    });
    expect(
      await findSesIdentityTenantNames({ sesClient, domain: NEW_DOMAIN }),
    ).toEqual([APPLE_TENANT_NAME]);
  });

  it('for an SES identity created for this workspace', async () => {
    const { sesClient } = flociSesDriver;

    await sesClient.send(
      new CreateEmailIdentityCommand({
        EmailIdentity: OWN_DOMAIN,
        Tags: [{ Key: AWS_SES_TENANT_TAG_KEY, Value: APPLE_TENANT_NAME }],
      }),
    );

    const { data } = await createEmailingDomain({
      expectToFail: false,
      input: { domain: OWN_DOMAIN },
    });

    expect(data.createEmailingDomain.domain).toBe(OWN_DOMAIN);
    expect(
      await findSesIdentityTenantNames({ sesClient, domain: OWN_DOMAIN }),
    ).toEqual([APPLE_TENANT_NAME]);
  });
});
