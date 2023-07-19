import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';
import seedPipelineStages from 'src/core/pipeline/seed-data/pipeline-stages.json';

@Injectable()
export class PipelineStageService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.pipelineStage.findFirst;
  findFirstOrThrow = this.prismaService.pipelineStage.findFirstOrThrow;

  findUnique = this.prismaService.pipelineStage.findUnique;
  findUniqueOrThrow = this.prismaService.pipelineStage.findUniqueOrThrow;

  findMany = this.prismaService.pipelineStage.findMany;

  // Create
  create = this.prismaService.pipelineStage.create;
  createMany = this.prismaService.pipelineStage.createMany;

  // Update
  update = this.prismaService.pipelineStage.update;
  upsert = this.prismaService.pipelineStage.upsert;
  updateMany = this.prismaService.pipelineStage.updateMany;

  // Delete
  delete = this.prismaService.pipelineStage.delete;
  deleteMany = this.prismaService.pipelineStage.deleteMany;

  // Aggregate
  aggregate = this.prismaService.pipelineStage.aggregate;

  // Count
  count = this.prismaService.pipelineStage.count;

  // GroupBy
  groupBy = this.prismaService.pipelineStage.groupBy;

  // Customs
  async createDefaultPipelineStages({
    workspaceId,
    pipelineId,
  }: {
    workspaceId: string;
    pipelineId: string;
  }) {
    const pipelineStages = seedPipelineStages.map((pipelineStage) => ({
      ...pipelineStage,
      workspaceId,
      pipelineId,
    }));
    return this.createMany({
      data: pipelineStages,
    });
  }
}
