import {
  ListResourceTenantsCommand,
  type SESv2Client,
} from '@aws-sdk/client-sesv2';

import {
  FLOCI_SES_ACCOUNT_ID,
  FLOCI_SES_REGION,
} from 'test/integration/metadata/suites/emailing-domain/constants/floci-ses.constants';

export const findSesIdentityTenantNames = async ({
  sesClient,
  domain,
}: {
  sesClient: SESv2Client;
  domain: string;
}): Promise<(string | undefined)[]> => {
  const { ResourceTenants } = await sesClient.send(
    new ListResourceTenantsCommand({
      ResourceArn: `arn:aws:ses:${FLOCI_SES_REGION}:${FLOCI_SES_ACCOUNT_ID}:identity/${domain}`,
    }),
  );

  return (ResourceTenants ?? []).map(({ TenantName }) => TenantName);
};
