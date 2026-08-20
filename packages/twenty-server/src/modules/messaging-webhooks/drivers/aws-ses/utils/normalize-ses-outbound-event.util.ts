import { isDefined } from 'twenty-shared/utils';

import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { type NormalizedSesOutboundEvent } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/normalized-ses-outbound-event.type';
import { type SesOutboundEventPayload } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-event-payload.type';
import { type SesOutboundNotification } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-notification.type';
import { resolveSesOutboundDeliveryOutcome } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/resolve-ses-outbound-delivery-outcome.util';
import { resolveWorkspaceIdFromAwsSesResources } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/resolve-workspace-id-from-aws-ses-resources.util';
import { resolveWorkspaceIdFromSesOutboundPayload } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/resolve-workspace-id-from-ses-outbound-payload.util';

const resolveSendingStatus = (
  eventName: string,
): EmailingDomainTenantStatus | null => {
  switch (eventName) {
    case 'Sending Status Enabled':
      return EmailingDomainTenantStatus.ACTIVE;
    case 'Sending Status Disabled':
      return EmailingDomainTenantStatus.PAUSED;
    default:
      return null;
  }
};

const classifyOutboundEvent = ({
  eventName,
  payload,
  workspaceId,
}: {
  eventName: string;
  payload: SesOutboundEventPayload;
  workspaceId: string | null;
}): NormalizedSesOutboundEvent => {
  const outcome = resolveSesOutboundDeliveryOutcome({ eventName, payload });

  if (isDefined(outcome)) {
    if (!isDefined(workspaceId)) {
      return {
        status: 'UNPROCESSABLE',
        eventName,
        reason: 'UNRESOLVED_WORKSPACE',
      };
    }

    return {
      status: 'DELIVERY',
      delivery: {
        workspaceId,
        deliveryStatus: outcome.deliveryStatus,
        suppression: outcome.suppression,
        providerMessageId: payload.mail?.messageId ?? null,
        providerEventId: outcome.providerEventId,
      },
    };
  }

  const sendingStatus = resolveSendingStatus(eventName);

  if (!isDefined(sendingStatus)) {
    return {
      status: 'UNPROCESSABLE',
      eventName,
      reason: 'UNSUPPORTED_EVENT_NAME',
    };
  }

  if (!isDefined(workspaceId)) {
    return {
      status: 'UNPROCESSABLE',
      eventName,
      reason: 'UNRESOLVED_WORKSPACE',
    };
  }

  return {
    status: 'SENDING_STATE',
    sendingState: { workspaceId, status: sendingStatus },
  };
};

export const normalizeSesOutboundEvent = (
  notification: SesOutboundNotification,
): NormalizedSesOutboundEvent => {
  if ('detail-type' in notification) {
    const payload = notification.detail ?? {};

    return classifyOutboundEvent({
      eventName: notification['detail-type'],
      payload,
      workspaceId:
        resolveWorkspaceIdFromAwsSesResources(notification.resources) ??
        resolveWorkspaceIdFromSesOutboundPayload(payload),
    });
  }

  return classifyOutboundEvent({
    eventName: notification.eventType,
    payload: notification,
    workspaceId: resolveWorkspaceIdFromSesOutboundPayload(notification),
  });
};
