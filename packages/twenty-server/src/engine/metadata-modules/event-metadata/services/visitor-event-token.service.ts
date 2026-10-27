import { Injectable } from '@nestjs/common';

import {
  ANONYMOUS_ID_PATTERN,
  type CreateVisitorEventTokenResult,
  EVENT_LIMITS,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AppEventVisitorJwtPayload } from 'src/engine/core-modules/auth/types/app-event-visitor-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { findApplicationFlatEventMetadataByName } from 'src/engine/metadata-modules/event-metadata/utils/find-application-flat-event-metadata-by-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class VisitorEventTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
    if (!ANONYMOUS_ID_PATTERN.test(anonymousId)) {
      throw new EventMetadataException(
        `anonymousId must match ${ANONYMOUS_ID_PATTERN}`,
        EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN_INPUT,
      );
    }

    if (
      events.length === 0 ||
      events.length > EVENT_LIMITS.MAX_EVENTS_PER_VISITOR_TOKEN
    ) {
      throw new EventMetadataException(
        `A visitor token must list between 1 and ${EVENT_LIMITS.MAX_EVENTS_PER_VISITOR_TOKEN} events`,
        EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN_INPUT,
      );
    }

    if (
      !Number.isInteger(expiresInSeconds) ||
      expiresInSeconds < 1 ||
      expiresInSeconds > EVENT_LIMITS.MAX_VISITOR_TOKEN_TTL_SECONDS
    ) {
      throw new EventMetadataException(
        `expiresInSeconds must be an integer between 1 and ${EVENT_LIMITS.MAX_VISITOR_TOKEN_TTL_SECONDS}`,
        EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN_INPUT,
      );
    }

    const { flatEventMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
      ]);

    const eventMetadataIds = [...new Set(events)].map((event) => {
      const flatEventMetadata = findApplicationFlatEventMetadataByName({
        flatEventMetadataMaps,
        applicationId,
        name: event,
      });

      if (!isDefined(flatEventMetadata)) {
        throw new EventMetadataException(
          `Event "${event}" is not declared by this application`,
          EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND,
        );
      }

      const hasVisitorScope = (
        flatEventMetadata.capabilities.realtime?.scopes ?? []
      ).some((scope) => scope.kind === 'visitor');

      if (!hasVisitorScope) {
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
  ): Promise<AppEventVisitorJwtPayload & { exp: number }> {
    const verifiedPayload: AppEventVisitorJwtPayload =
      await this.jwtWrapperService.verifyJwtToken(token).catch(() => {
        throw new EventMetadataException(
          'Visitor event token signature invalid or expired',
          EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN,
        );
      });

    if (
      verifiedPayload.type !== JwtTokenTypeEnum.APP_EVENT_VISITOR ||
      !isDefined(verifiedPayload.exp)
    ) {
      throw new EventMetadataException(
        'Wrong JWT type for a visitor event token',
        EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN,
      );
    }

    return { ...verifiedPayload, exp: verifiedPayload.exp };
  }
}
