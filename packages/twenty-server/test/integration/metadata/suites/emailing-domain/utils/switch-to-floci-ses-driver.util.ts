import { SESv2Client } from '@aws-sdk/client-sesv2';

import {
  FLOCI_SES_ACCOUNT_ID,
  FLOCI_SES_REGION,
} from 'test/integration/metadata/suites/emailing-domain/constants/floci-ses.constants';
import { type FlociSesDriver } from 'test/integration/metadata/suites/emailing-domain/types/floci-ses-driver.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { mockConfigVariables } from 'test/integration/utils/mock-config-variables.util';
import { startFlociContainer } from 'test/integration/utils/start-floci-container.util';

import { type AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';

const FLOCI_CREDENTIALS = { accessKeyId: 'test', secretAccessKey: 'test' };

export const switchToFlociSesDriver = async (): Promise<FlociSesDriver> => {
  const floci = await startFlociContainer();

  const sesClient = new SESv2Client({
    region: FLOCI_SES_REGION,
    credentials: FLOCI_CREDENTIALS,
    endpoint: floci.endpoint,
  });

  // EMAILING_DOMAIN_DRIVER is env-only, so it cannot go through updateConfigVariable
  mockConfigVariables({
    EMAILING_DOMAIN_DRIVER: EmailingDomainDriver.AWS_SES,
    AWS_SES_REGION: FLOCI_SES_REGION,
    AWS_SES_ACCOUNT_ID: FLOCI_SES_ACCOUNT_ID,
  });

  jest
    .spyOn(
      getAppProviderByClassName<AwsSesClientProvider>('AwsSesClientProvider'),
      'getSESClient',
    )
    .mockReturnValue(sesClient);

  jest
    .spyOn(
      getAppProviderByClassName<EnterprisePlanService>('EnterprisePlanService'),
      'isValid',
    )
    .mockReturnValue(true);

  return {
    sesClient,
    restore: async () => {
      jest.restoreAllMocks();
      await floci.stop();
    },
  };
};
