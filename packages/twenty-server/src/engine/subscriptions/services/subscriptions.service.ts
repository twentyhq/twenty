import { Inject, Injectable } from '@nestjs/common';

import { FieldNode, OperationDefinitionNode, parse } from 'graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ON_DB_EVENT_TRIGGER } from 'src/engine/subscriptions/constants/on-db-event-trigger';
import { OnDbEventDTO } from 'src/engine/subscriptions/dtos/on-db-event.dto';
import { SubscriptionInput } from 'src/engine/subscriptions/dtos/subscription.input';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async publish(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    for (const eventData of workspaceEventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: workspaceEventBatch.name,
        event: eventData,
      });

      await this.pubSub.publish(ON_DB_EVENT_TRIGGER, {
        onDbEvent: {
          action: operation,
          objectNameSingular: nameSingular,
          eventDate: new Date(),
          record,
          ...(updatedFields && { updatedFields }),
        },
      });
    }
  }

  public async isSubscriptionMatchingEvent(
    subscription: SubscriptionInput,
    event: OnDbEventDTO,
    workspaceId: string,
  ): Promise<boolean> {
    const objectName = this.parseQueryObjectName(subscription.query);

    if (!objectName) {
      return false;
    }

    if (
      subscription.selectedEventActions &&
      !subscription.selectedEventActions.includes(event.action)
    ) {
      return false;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const eventObjectMetadata = Object.values(flatObjectMetadataMaps.byId).find(
      (metadata: FlatObjectMetadata) =>
        metadata.nameSingular === event.objectNameSingular,
    );

    if (!eventObjectMetadata) {
      return false;
    }

    const queryObjectNameLower = objectName.toLowerCase();
    const eventNameSingularLower =
      eventObjectMetadata.nameSingular.toLowerCase();
    const eventNamePluralLower = eventObjectMetadata.namePlural.toLowerCase();

    return (
      queryObjectNameLower === eventNameSingularLower ||
      queryObjectNameLower === eventNamePluralLower
    );
  }

  private parseQueryObjectName(queryString: string): string | null {
    try {
      const { query } = JSON.parse(queryString) as {
        query: string;
        variables?: Record<string, unknown>;
      };

      const ast = parse(query);

      const firstOperation = ast.definitions.find(
        (def): def is OperationDefinitionNode =>
          def.kind === 'OperationDefinition',
      );

      if (!firstOperation) {
        return null;
      }

      const rootSelection = firstOperation.selectionSet.selections[0];

      if (rootSelection.kind !== 'Field') {
        return null;
      }

      const rootField = rootSelection as FieldNode;

      return rootField.name.value;
    } catch {
      return null;
    }
  }
}
