import { isNonEmptyString } from '@sniptt/guards';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  isSameViewAudience,
  resolveViewAudience,
  type ViewAudience,
  type ViewAudienceRecord,
} from 'src/engine/subscriptions/view-family-event/utils/resolve-view-audience.util';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

type BroadcastTargeting = Pick<
  WorkspaceBroadcastEvent,
  'recipientUserWorkspaceIds' | 'excludedUserWorkspaceIds'
>;

const toTargeting = (audience: ViewAudience): BroadcastTargeting =>
  audience.type === 'workspace'
    ? {}
    : { recipientUserWorkspaceIds: audience.userWorkspaceIds };

const resolveLostAudienceTargeting = ({
  before,
  after,
}: {
  before: ViewAudience;
  after: ViewAudience;
}): BroadcastTargeting | undefined => {
  if (before.type === 'workspace') {
    return after.type === 'workspace'
      ? undefined
      : { excludedUserWorkspaceIds: after.userWorkspaceIds };
  }

  const keptUserWorkspaceIds =
    after.type === 'workspace' ? undefined : after.userWorkspaceIds;

  if (!isDefined(keptUserWorkspaceIds)) {
    return undefined;
  }

  const lostUserWorkspaceIds = before.userWorkspaceIds.filter(
    (userWorkspaceId) => !keptUserWorkspaceIds.includes(userWorkspaceId),
  );

  return lostUserWorkspaceIds.length > 0
    ? { recipientUserWorkspaceIds: lostUserWorkspaceIds }
    : undefined;
};

type EventRecord = Record<string, unknown> | undefined;

const getEventRecord = (event: MetadataEvent): EventRecord =>
  event.type === 'deleted' ? event.properties.before : event.properties.after;

const buildViewBroadcastEvents = (
  event: MetadataEvent,
): WorkspaceBroadcastEvent[] => {
  const baseEvent = {
    type: event.type,
    entityName: 'view',
    recordId: event.recordId,
    properties: event.properties,
  };

  if (event.type !== 'updated') {
    return [
      {
        ...baseEvent,
        ...toTargeting(resolveViewAudience(getEventRecord(event))),
      },
    ];
  }

  const beforeRecord: EventRecord = event.properties.before;
  const afterRecord: EventRecord = event.properties.after;
  const beforeAudience = resolveViewAudience(beforeRecord);
  const afterAudience = resolveViewAudience(afterRecord);

  if (isSameViewAudience(beforeAudience, afterAudience)) {
    return [{ ...baseEvent, ...toTargeting(afterAudience) }];
  }

  const updatedEvent = {
    ...baseEvent,
    properties: {
      updatedFields: event.properties.updatedFields,
      after: afterRecord,
    },
    ...toTargeting(afterAudience),
  };

  const lostAudienceTargeting = resolveLostAudienceTargeting({
    before: beforeAudience,
    after: afterAudience,
  });

  return isDefined(lostAudienceTargeting)
    ? [
        updatedEvent,
        {
          type: 'deleted',
          entityName: 'view',
          recordId: event.recordId,
          properties: {},
          ...lostAudienceTargeting,
        },
      ]
    : [updatedEvent];
};

export const buildViewFamilyBroadcastEvents = ({
  metadataName,
  events,
  findParentView,
}: {
  metadataName: AllMetadataName;
  events: MetadataEvent[];
  findParentView: (viewId: string) => ViewAudienceRecord | undefined;
}): WorkspaceBroadcastEvent[] =>
  events.flatMap((event) => {
    if (metadataName === 'view') {
      return buildViewBroadcastEvents(event);
    }

    const viewId = getEventRecord(event)?.viewId;

    return [
      {
        type: event.type,
        entityName: metadataName,
        recordId: event.recordId,
        properties: event.properties,
        ...toTargeting(
          resolveViewAudience(
            isNonEmptyString(viewId) ? findParentView(viewId) : undefined,
          ),
        ),
      },
    ];
  });
