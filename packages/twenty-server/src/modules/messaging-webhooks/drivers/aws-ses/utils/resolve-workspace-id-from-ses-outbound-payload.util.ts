import { isDefined } from 'twenty-shared/utils';

import { type SesOutboundEventPayload } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-event-payload.type';
import { parseWorkspaceIdFromAwsSesResourceName } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/parse-workspace-id-from-aws-ses-resource-name.util';

const CONFIGURATION_SET_MAIL_TAG_KEY = 'ses:configuration-set';

export const resolveWorkspaceIdFromSesOutboundPayload = (
  payload: SesOutboundEventPayload,
): string | null => {
  const configurationSetNames =
    payload.mail?.tags?.[CONFIGURATION_SET_MAIL_TAG_KEY] ?? [];

  for (const configurationSetName of configurationSetNames) {
    const workspaceId =
      parseWorkspaceIdFromAwsSesResourceName(configurationSetName);

    if (isDefined(workspaceId)) {
      return workspaceId;
    }
  }

  return null;
};
