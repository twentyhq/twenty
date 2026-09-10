import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CallRecordingService } from 'src/modules/call-recording/services/call-recording.service';

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class CallRecordingResolver {
  constructor(private readonly callRecordingService: CallRecordingService) {}

  @Query(() => UUIDScalarType, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async callRecordingIdForCalendarEvent(
    @Args('calendarEventId', { type: () => UUIDScalarType })
    calendarEventId: string,
  ): Promise<string | undefined> {
    return this.callRecordingService.findCallRecordingIdForCalendarEvent(
      calendarEventId,
    );
  }
}
