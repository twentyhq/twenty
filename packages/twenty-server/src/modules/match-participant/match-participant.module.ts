import { Module } from '@nestjs/common';

import { ReconcileOpportunityTargetsJob } from 'src/modules/match-participant/jobs/reconcile-opportunity-targets.job';
import { ReconcilePersonCompanyTargetsJob } from 'src/modules/match-participant/jobs/reconcile-person-company-targets.job';
import { ParticipantTargetOpportunityListener } from 'src/modules/match-participant/listeners/participant-target-opportunity.listener';
import { ParticipantTargetPersonListener } from 'src/modules/match-participant/listeners/participant-target-person.listener';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';

@Module({
  imports: [],
  providers: [
    MatchParticipantService,
    ParticipantTargetReconciliationService,
    ReconcilePersonCompanyTargetsJob,
    ReconcileOpportunityTargetsJob,
    ParticipantTargetPersonListener,
    ParticipantTargetOpportunityListener,
  ],
  exports: [MatchParticipantService, ParticipantTargetReconciliationService],
})
export class MatchParticipantModule {}
