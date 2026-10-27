import { Injectable } from '@nestjs/common';

import {
  type CreateVisitorEventTokenResult,
  EVENT_LIMITS,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type AppEventVisitorJwtPayload } from 'src/engine/core-modules/auth/types/app-event-visitor-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MAX_CONNECTIONS_PER_VISITOR_TOKEN } from 'src/engine/metadata-modules/event-metadata/constants/event-stream.constant';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { buildEventRealtimeChannel } from 'src/engine/metadata-modules/event-metadata/utils/build-event-realtime-channel.util';
import { findApplicationFlatEventMetadataByNameOrThrow } from 'src/engine/metadata-modules/event-metadata/utils/find-application-flat-event-metadata-by-name-or-throw.util';
import { hasVisitorRealtimeScope } from 'src/engine/metadata-modules/event-metadata/utils/has-visitor-realtime-scope.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type VerifiedAppEventVisitorJwtPayload = AppEventVisitorJwtPayload & {
  jti: string;
  exp: number;
};

@Injectable()
export class VisitorEventTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectCacheStorage(CacheStorageNamespace.EngineSubscriptions)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async create({
    workspaceId,
    applicationId,
    anonymousId,
    events,
    expiresInSeconds = EVENT_LIMITS.DEFAULT_VISITOR_TOKEN_TTL_SECONDS,
  }: {
    workspaceId: string;
    applicationId: string;
    anonymousId: string;
    events: string[];
    expiresInSeconds?: number;
  }): Promise<CreateVisitorEventTokenResult> {
    const { flatEventMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
      ]);

    const eventMetadataIds = [...new Set(events)].map((event) => {
      const flatEventMetadata = findApplicationFlatEventMetadataByNameOrThrow({
        flatEventMetadataMaps,
        applicationId,
        name: event,
      });

      if (!hasVisitorRealtimeScope(flatEventMetadata)) {
        throw new EventMetadataException(
          `Event "${event}" does not declare a visitor realtime scope`,
          EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN_INPUT,
        );
      }

      return flatEventMetadata.id;
    });

    const payload: AppEventVisitorJwtPayload = {
      sub: anonymousId,
      type: JwtTokenTypeEnum.APP_EVENT_VISITOR,
      workspaceId,
      applicationId,
      anonymousId,
      eventMetadataIds,
    };

    const token = await this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: expiresInSeconds,
      jwtid: v4(),
    });

    return {
      token,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    };
  }

  async verifyOrThrow(
    token: string,
  ): Promise<VerifiedAppEventVisitorJwtPayload> {
    const { jti, exp, ...verifiedPayload }: AppEventVisitorJwtPayload =
      await this.jwtWrapperService.verifyJwtToken(token).catch(() => {
        throw new EventMetadataException(
          'Visitor event token signature invalid or expired',
          EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN,
        );
      });

    if (
      verifiedPayload.type !== JwtTokenTypeEnum.APP_EVENT_VISITOR ||
      !isDefined(jti) ||
      !isDefined(exp)
    ) {
      throw new EventMetadataException(
        'Wrong JWT type for a visitor event token',
        EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN,
      );
    }

    return { ...verifiedPayload, jti, exp };
  }

  async resolveChannelsOrThrow({
    workspaceId,
    applicationId,
    anonymousId,
    eventMetadataIds,
  }: VerifiedAppEventVisitorJwtPayload): Promise<string[]> {
    const { flatEventMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
      ]);

    const channels = findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatEventMetadataMaps,
      flatEntityIds: eventMetadataIds,
    })
      .filter(
        (flatEventMetadata) =>
          flatEventMetadata.applicationId === applicationId &&
          hasVisitorRealtimeScope(flatEventMetadata),
      )
      .map((flatEventMetadata) =>
        buildEventRealtimeChannel({
          workspaceId,
          eventMetadataId: flatEventMetadata.id,
          scope: { kind: 'visitor', anonymousId },
        }),
      );

    if (channels.length === 0) {
      throw new EventMetadataException(
        'None of the events in this visitor token can be streamed anymore',
        EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN,
      );
    }

    return channels;
  }

  async acquireStreamSlotOrThrow({
    jti,
    exp,
  }: VerifiedAppEventVisitorJwtPayload): Promise<() => Promise<void>> {
    const connectionCountKey = `appEventVisitorStreamConnections:${jti}`;
    const connectionCount = await this.cacheStorageService.incrBy(
      connectionCountKey,
      1,
    );

    await this.cacheStorageService.expire(
      connectionCountKey,
      Math.max(exp - Math.floor(Date.now() / 1000), 1) * 1000,
    );

    const releaseStreamSlot = async () => {
      await this.cacheStorageService.incrBy(connectionCountKey, -1);
    };

    if (connectionCount > MAX_CONNECTIONS_PER_VISITOR_TOKEN) {
      await releaseStreamSlot();

      throw new EventMetadataException(
        'Too many open streams for this visitor token',
        EventMetadataExceptionCode.TOO_MANY_VISITOR_EVENT_STREAMS,
      );
    }

    return releaseStreamSlot;
  }
}
