import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { CallRecordingResolver } from 'src/modules/call-recording/resolvers/call-recording.resolver';
import { CallRecordingService } from 'src/modules/call-recording/services/call-recording.service';

@Module({
  imports: [PermissionsModule],
  providers: [CallRecordingResolver, CallRecordingService],
})
export class CallRecordingModule {}
