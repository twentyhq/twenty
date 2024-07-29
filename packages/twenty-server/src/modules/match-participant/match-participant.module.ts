import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

@Module({
  imports: [],
  providers: [ScopedWorkspaceContextFactory, MatchParticipantService],
  exports: [MatchParticipantService],
})
export class MatchParticipantModule {}
