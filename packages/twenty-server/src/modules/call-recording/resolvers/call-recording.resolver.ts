import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CallRecordingService } from 'src/modules/call-recording/services/call-recording.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver()
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [],
  }),
)
@UsePipes(ResolverValidationPipe)
export class CallRecordingResolver {
  constructor(private readonly callRecordingService: CallRecordingService) {}

  @Query(() => UUIDScalarType, { nullable: true })
  async callRecordingIdForCalendarEvent(
    @Args('calendarEventId', { type: () => UUIDScalarType })
    calendarEventId: string,
  ): Promise<string | undefined> {
    return this.callRecordingService.findCallRecordingIdForCalendarEvent(
      calendarEventId,
    );
  }
}
