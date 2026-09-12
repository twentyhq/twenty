import { Module } from '@nestjs/common';

import { CallRecordingResolver } from 'src/modules/call-recording/resolvers/call-recording.resolver';
import { CallRecordingService } from 'src/modules/call-recording/services/call-recording.service';

@Module({
  providers: [CallRecordingResolver, CallRecordingService],
})
export class CallRecordingModule {}
