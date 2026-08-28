import { Module } from '@nestjs/common';

import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';

@Module({
  imports: [],
  providers: [MatchParticipantService, ParticipantTargetReconciliationService],
  exports: [MatchParticipantService, ParticipantTargetReconciliationService],
})
export class MatchParticipantModule {}
