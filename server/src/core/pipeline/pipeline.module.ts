import { Module } from '@nestjs/common';

import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { PipelineService } from './services/pipeline.service';
import { PipelineResolver } from './resolvers/pipeline.resolver';
import { PipelineStageResolver } from './resolvers/pipeline-stage.resolver';
import { PipelineProgressResolver } from './resolvers/pipeline-progress.resolver';
import { PipelineStageService } from './services/pipeline-stage.service';
import { PipelineProgressService } from './services/pipeline-progress.service';

@Module({
  imports: [AbilityModule, PrismaModule],
  providers: [
    PipelineService,
    PipelineStageService,
    PipelineProgressService,
    PipelineResolver,
    PipelineStageResolver,
    PipelineProgressResolver,
  ],
  exports: [PipelineService, PipelineStageService, PipelineProgressService],
})
export class PipelineModule {}
