import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

@Module({
  imports: [TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata')],
  providers: [ScopedWorkspaceContextFactory, MatchParticipantService],
  exports: [MatchParticipantService],
})
export class MatchParticipantModule {}
