import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ReconcilePersonCompanyTargetsJob } from 'src/modules/match-participant/jobs/reconcile-person-company-targets.job';
import { ParticipantTargetPersonListener } from 'src/modules/match-participant/listeners/participant-target-person.listener';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { PersonHandleFieldService } from 'src/modules/match-participant/person-handle-field/person-handle-field.service';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity]),
    WorkspaceCacheModule,
  ],
  providers: [
    MatchParticipantService,
    ParticipantTargetReconciliationService,
    PersonHandleFieldService,
    ReconcilePersonCompanyTargetsJob,
    ParticipantTargetPersonListener,
  ],
  exports: [
    MatchParticipantService,
    ParticipantTargetReconciliationService,
    PersonHandleFieldService,
  ],
})
export class MatchParticipantModule {}
