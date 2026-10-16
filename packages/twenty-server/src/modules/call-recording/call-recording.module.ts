import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CallRecordingCalendarParticipantListener } from 'src/modules/call-recording/listeners/call-recording-calendar-participant.listener';
import { CallRecordingCalendarParticipantService } from 'src/modules/call-recording/services/call-recording-calendar-participant.service';
import { CallRecordingResolver } from 'src/modules/call-recording/resolvers/call-recording.resolver';
import { CallRecordingService } from 'src/modules/call-recording/services/call-recording.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity])],
  providers: [
    provideWorkspaceScopedRepository(ApplicationEntity),
    CallRecordingResolver,
    CallRecordingService,
    CallRecordingCalendarParticipantListener,
    CallRecordingCalendarParticipantService,
  ],
})
export class CallRecordingModule {}
