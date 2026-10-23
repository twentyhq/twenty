import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ReconcilePersonCompanyTargetsJob } from 'src/modules/match-participant/jobs/reconcile-person-company-targets.job';
import { ParticipantTargetPersonListener } from 'src/modules/match-participant/listeners/participant-target-person.listener';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageChannelEntity])],
  providers: [
    MatchParticipantService,
    ParticipantTargetReconciliationService,
    ReconcilePersonCompanyTargetsJob,
    ParticipantTargetPersonListener,
  ],
  exports: [MatchParticipantService, ParticipantTargetReconciliationService],
})
export class MatchParticipantModule {}
