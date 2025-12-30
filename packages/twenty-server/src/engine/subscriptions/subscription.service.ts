import { Injectable } from '@nestjs/common';

import { FieldNode, OperationDefinitionNode, parse } from 'graphql';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { OnDbEventDTO } from 'src/engine/subscriptions/dtos/on-db-event.dto';
import { SubscriptionInput } from 'src/engine/subscriptions/dtos/subscription.input';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly redisClient: RedisClientService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private getSubscriptionChannel({
    channel,
    workspaceId,
  }: {
    channel: SubscriptionChannel;
    workspaceId: string;
  }) {
    return `${channel}:${workspaceId}`;
  }

  async subscribe({
    channel,
    workspaceId,
  }: {
    channel: SubscriptionChannel;
    workspaceId: string;
  }) {
    const client = this.redisClient.getPubSubClient();

    return client.asyncIterator(
      this.getSubscriptionChannel({ channel, workspaceId }),
    );
  }

  async publish<T>({
    channel,
    payload,
    workspaceId,
  }: {
    channel: SubscriptionChannel;
    payload: T;
    workspaceId: string;
  }): Promise<void> {
    const client = this.redisClient.getPubSubClient();

    await client.publish(
      this.getSubscriptionChannel({ channel, workspaceId }),
      payload,
    );
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
