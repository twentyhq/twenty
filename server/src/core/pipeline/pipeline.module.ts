import { Module } from '@nestjs/common';
import { PipelineService } from './services/pipeline.service';
import { PipelineResolver } from './resolvers/pipeline.resolver';
import { PipelineRelationsResolver } from './resolvers/pipeline-relations.resolver';
import { PipelineStageResolver } from './resolvers/pipeline-stage.resolver';
import { PipelineStageRelationsResolver } from './resolvers/pipeline-stage-relations.resolver';
import { PipelineProgressResolver } from './resolvers/pipeline-progress.resolver';
import { PipelineProgressRelationsResolver } from './resolvers/pipeline-progress-relations.resolver';
import { PipelineStageService } from './services/pipeline-stage.service';
import { PipelineProgressService } from './services/pipeline-progress.service';

@Module({
  imports: [],
  providers: [
    PipelineService,
    PipelineStageService,
    PipelineProgressService,
    PipelineResolver,
    PipelineRelationsResolver,
    PipelineStageResolver,
    PipelineStageRelationsResolver,
    PipelineProgressResolver,
    PipelineProgressRelationsResolver,
  ],
  exports: [PipelineService, PipelineStageService, PipelineProgressService],
})
export class PipelineModule {}
