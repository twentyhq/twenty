import { Injectable } from '@nestjs/common';

import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { PipelineService } from 'src/core/pipeline/services/pipeline.service';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pipelineService: PipelineService,
    private readonly pipelineStageService: PipelineStageService,
  ) {}

  // Find
  findFirst = this.prismaService.workspace.findFirst;
  findFirstOrThrow = this.prismaService.workspace.findFirstOrThrow;

  findUnique = this.prismaService.workspace.findUnique;
  findUniqueOrThrow = this.prismaService.workspace.findUniqueOrThrow;

  findMany = this.prismaService.workspace.findMany;

  // Create
  create = this.prismaService.workspace.create;
  createMany = this.prismaService.workspace.createMany;

  // Update
  update = this.prismaService.workspace.update;
  upsert = this.prismaService.workspace.upsert;
  updateMany = this.prismaService.workspace.updateMany;

  // Delete
  delete = this.prismaService.workspace.delete;
  deleteMany = this.prismaService.workspace.deleteMany;

  // Aggregate
  aggregate = this.prismaService.workspace.aggregate;

  // Count
  count = this.prismaService.workspace.count;

  // GroupBy
  groupBy = this.prismaService.workspace.groupBy;

  // Customs
  async createDefaultWorkspace() {
    const workspace = await this.create({ data: {} });

    // Create default pipeline
    const pipeline = await this.pipelineService.createDefaultPipeline({
      workspaceId: workspace.id,
    });

    // Create default stages
    await this.pipelineStageService.createDefaultPipelineStages({
      pipelineId: pipeline.id,
      workspaceId: workspace.id,
    });

    return workspace;
  }
}
