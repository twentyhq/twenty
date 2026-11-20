import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { NavigationMenuItemRecordIdentifierService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-record-identifier.service';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { VIEW_CHILD_METADATA_NAMES } from 'src/engine/metadata-modules/view/constants/view-child-metadata-names.constant';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { computeRecipientsWhoLostAccess } from 'src/engine/subscriptions/metadata-event/utils/compute-recipients-who-lost-access.util';
import { enrichFieldMetadataEventRecord } from 'src/engine/subscriptions/metadata-event/utils/enrich-field-metadata-event-record.util';
import { filterMorphRelationDuplicateFieldMetadataEvents } from 'src/engine/subscriptions/metadata-event/utils/filter-morph-relation-duplicate-field-metadata-events.util';
import { getRequiredPermissionFlagForBroadcastEntityName } from 'src/engine/subscriptions/constants/required-permission-flag-by-broadcast-entity-name.constant';
import { pickBroadcastEventProperties } from 'src/engine/subscriptions/utils/pick-broadcast-event-properties.util';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

type BroadcastEventRecord = {
  userWorkspaceId?: string | null;
  visibility?: WorkflowVisibility | ViewVisibility | null;
  isPrivate?: boolean | null;
  createdByUserWorkspaceId?: string | null;
  coreWorkflowId?: string | null;
  viewId?: string | null;
  overrides?: FlatView['overrides'];
  applicationUniversalIdentifier?: string;
};

type RecipientParentFlatEntityMaps = Partial<
  Pick<AllFlatEntityMaps, 'flatWorkflowMaps' | 'flatViewMaps'>
>;

const getBroadcastEventRecord = (event: MetadataEventBatch['events'][number]) =>
  (event.type === 'deleted'
    ? event.properties.before
    : event.properties.after) as BroadcastEventRecord | undefined;

const getWorkflowRecipientUserWorkspaceIds = (
  workflow: Pick<
    BroadcastEventRecord,
    'visibility' | 'createdByUserWorkspaceId'
  >,
): string[] | undefined => {
  if (workflow.visibility !== WorkflowVisibility.PRIVATE) {
    return undefined;
  }

  return isNonEmptyString(workflow.createdByUserWorkspaceId)
    ? [workflow.createdByUserWorkspaceId]
    : [];
};

const getAgentRecipientUserWorkspaceIds = (
  agent: Pick<BroadcastEventRecord, 'isPrivate' | 'createdByUserWorkspaceId'>,
): string[] | undefined => {
  if (!agent.isPrivate) {
    return undefined;
  }

  return isNonEmptyString(agent.createdByUserWorkspaceId)
    ? [agent.createdByUserWorkspaceId]
    : [];
};

const getViewRecipientUserWorkspaceIds = (
  view: Pick<
    BroadcastEventRecord,
    | 'visibility'
    | 'createdByUserWorkspaceId'
    | 'overrides'
    | 'applicationUniversalIdentifier'
  >,
): string[] | undefined => {
  const visibility = resolveEffectiveFlatEntityProperty({
    metadataName: 'view',
    flatEntity: view,
    property: 'visibility',
  });

  if (visibility === ViewVisibility.WORKSPACE) {
    return undefined;
  }

  return visibility === ViewVisibility.UNLISTED &&
    isNonEmptyString(view.createdByUserWorkspaceId)
    ? [view.createdByUserWorkspaceId]
    : [];
};

const resolveRecipientUserWorkspaceIds = ({
  metadataName,
  record,
  flatWorkflowMaps,
  flatViewMaps,
}: RecipientParentFlatEntityMaps & {
  metadataName: MetadataEventBatch['metadataName'];
  record: BroadcastEventRecord | undefined;
}): string[] | undefined => {
  if (isDefined(flatViewMaps)) {
    const parentFlatView = isNonEmptyString(record?.viewId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatViewMaps,
          flatEntityId: record.viewId,
        })
      : undefined;

    return isDefined(parentFlatView)
      ? getViewRecipientUserWorkspaceIds(parentFlatView)
      : [];
  }

  switch (metadataName) {
    case 'view':
      return isDefined(record) ? getViewRecipientUserWorkspaceIds(record) : [];
    case 'navigationMenuItem':
      return isNonEmptyString(record?.userWorkspaceId)
        ? [record.userWorkspaceId]
        : undefined;
    case 'workflow':
      return isDefined(record)
        ? getWorkflowRecipientUserWorkspaceIds(record)
        : undefined;
    case 'agent':
      return isDefined(record)
        ? getAgentRecipientUserWorkspaceIds(record)
        : undefined;
    case 'workflowVersion': {
      const coreWorkflowId = record?.coreWorkflowId;

      if (!isNonEmptyString(coreWorkflowId) || !isDefined(flatWorkflowMaps)) {
        return undefined;
      }

      const parentFlatWorkflow = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatWorkflowMaps,
        flatEntityId: coreWorkflowId,
      });

      if (!isDefined(parentFlatWorkflow)) {
        return [];
      }

      return getWorkflowRecipientUserWorkspaceIds(parentFlatWorkflow);
    }
    default:
      return undefined;
  }
};

@Injectable()
export class MetadataEventPublisher {
  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly navigationMenuItemRecordIdentifierService: NavigationMenuItemRecordIdentifierService,
  ) {}

  async publish(metadataEventBatch: MetadataEventBatch): Promise<void> {
    if (!isNonEmptyArray(metadataEventBatch.events)) {
      return;
    }

    const enrichedBatch =
      await this.enrichMetadataEventBatch(metadataEventBatch);

    const recipientParentFlatEntityMaps =
      await this.loadRecipientParentFlatEntityMaps(enrichedBatch);

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: enrichedBatch.workspaceId,
      updatedCollectionHash: enrichedBatch.updatedCollectionHash,
      events: enrichedBatch.events.flatMap((event) => {
        const properties = pickBroadcastEventProperties({
          entityName: event.metadataName,
          properties: event.properties as Record<string, unknown>,
        });
        const requiredPermissionFlag =
          getRequiredPermissionFlagForBroadcastEntityName(event.metadataName);
        const recipientUserWorkspaceIds = resolveRecipientUserWorkspaceIds({
          ...recipientParentFlatEntityMaps,
          metadataName: event.metadataName,
          record: getBroadcastEventRecord(event),
        });

        const broadcastEvent: WorkspaceBroadcastEvent = {
          type: event.type,
          entityName: event.metadataName,
          recordId: event.recordId,
          properties,
          recipientUserWorkspaceIds,
          requiredPermissionFlag,
        };

        if (event.type !== 'updated') {
          return [broadcastEvent];
        }

        const recipientsWhoLostAccess = computeRecipientsWhoLostAccess({
          recipientUserWorkspaceIdsBefore: resolveRecipientUserWorkspaceIds({
            ...recipientParentFlatEntityMaps,
            metadataName: event.metadataName,
            record: event.properties.before as BroadcastEventRecord,
          }),
          recipientUserWorkspaceIdsAfter: recipientUserWorkspaceIds,
        });

        if (!isDefined(recipientsWhoLostAccess)) {
          return [broadcastEvent];
        }

        return [
          broadcastEvent,
          {
            type: 'deleted',
            entityName: event.metadataName,
            recordId: event.recordId,
            properties: { before: properties.before },
            ...recipientsWhoLostAccess,
            requiredPermissionFlag,
          },
        ];
      }),
    });
  }

  private async loadRecipientParentFlatEntityMaps({
    metadataName,
    workspaceId,
  }: MetadataEventBatch): Promise<RecipientParentFlatEntityMaps> {
    if (metadataName === 'workflowVersion') {
      return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );
    }

    if (VIEW_CHILD_METADATA_NAMES.includes(metadataName)) {
      return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatViewMaps'] },
      );
    }

    return {};
  }

  private async enrichMetadataEventBatch(
    metadataEventBatch: MetadataEventBatch,
  ): Promise<MetadataEventBatch> {
    switch (metadataEventBatch.metadataName) {
      case 'fieldMetadata':
        return this.prepareFieldMetadataEvents(
          metadataEventBatch as MetadataEventBatch<'fieldMetadata'>,
        );
      case 'navigationMenuItem':
        return this.enrichNavigationMenuItemEventsWithTargetRecordIdentifier(
          metadataEventBatch as MetadataEventBatch<'navigationMenuItem'>,
        );
      default:
        return metadataEventBatch;
    }
  }

  private async prepareFieldMetadataEvents(
    metadataEventBatch: MetadataEventBatch<'fieldMetadata'>,
  ): Promise<MetadataEventBatch<'fieldMetadata'>> {
    const {
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
      flatObjectMetadataMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: metadataEventBatch.workspaceId,
          flatMapsKeys: [
            'flatFieldMetadataMaps',
            'flatFieldMetadataOptionMaps',
            'flatObjectMetadataMaps',
          ],
        },
      );

    const eventsWithoutMorphRelationDuplicates =
      filterMorphRelationDuplicateFieldMetadataEvents({
        events: metadataEventBatch.events,
        flatFieldMetadataMaps,
      });

    const enrichedEvents = eventsWithoutMorphRelationDuplicates.map((event) => {
      const enrichedProperties = { ...event.properties };

      if (
        'after' in enrichedProperties &&
        isDefined(enrichedProperties.after)
      ) {
        enrichedProperties.after = enrichFieldMetadataEventRecord({
          record: enrichedProperties.after as Record<string, unknown>,
          flatFieldMetadataMaps,
          flatFieldMetadataOptionMaps,
          flatObjectMetadataMaps,
        }) as typeof enrichedProperties.after;
      }

      return {
        ...event,
        properties: enrichedProperties,
      } as typeof event;
    });

    return { ...metadataEventBatch, events: enrichedEvents };
  }

  private async enrichNavigationMenuItemEventsWithTargetRecordIdentifier(
    metadataEventBatch: MetadataEventBatch<'navigationMenuItem'>,
  ): Promise<MetadataEventBatch<'navigationMenuItem'>> {
    const enrichedEvents = await Promise.all(
      metadataEventBatch.events.map(async (event) => {
        if (
          !('after' in event.properties) ||
          !isDefined(event.properties.after)
        ) {
          return event;
        }

        const after = event.properties.after as Record<string, unknown>;
        const targetRecordId = after.targetRecordId as string | undefined;
        const targetObjectMetadataId = after.targetObjectMetadataId as
          | string
          | undefined;

        if (!isDefined(targetRecordId) || !isDefined(targetObjectMetadataId)) {
          return event;
        }

        const targetRecordIdentifier =
          await this.navigationMenuItemRecordIdentifierService.resolveRecordIdentifier(
            {
              targetRecordId,
              targetObjectMetadataId,
              workspaceId: metadataEventBatch.workspaceId,
            },
          );

        const enrichedAfter: Record<string, unknown> = {
          ...after,
          targetRecordIdentifier,
        };

        return {
          ...event,
          properties: {
            ...event.properties,
            after: enrichedAfter,
          },
        } as typeof event;
      }),
    );

    return { ...metadataEventBatch, events: enrichedEvents };
  }
}
