import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';
import seedPipelineStages from 'src/core/pipeline/seed-data/pipeline-stages.json';

@Injectable()
export class PipelineStageService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.pipelineStage.findFirst;
  findFirstOrThrow = this.prismaService.client.pipelineStage.findFirstOrThrow;

  findUnique = this.prismaService.client.pipelineStage.findUnique;
  findUniqueOrThrow = this.prismaService.client.pipelineStage.findUniqueOrThrow;

  findMany = this.prismaService.client.pipelineStage.findMany;

  // Create
  create = this.prismaService.client.pipelineStage.create;
  createMany = this.prismaService.client.pipelineStage.createMany;

  // Update
  update = this.prismaService.client.pipelineStage.update;
  upsert = this.prismaService.client.pipelineStage.upsert;
  updateMany = this.prismaService.client.pipelineStage.updateMany;

  // Delete
  delete = this.prismaService.client.pipelineStage.delete;
  deleteMany = this.prismaService.client.pipelineStage.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.pipelineStage.aggregate;

  // Count
  count = this.prismaService.client.pipelineStage.count;

  // GroupBy
  groupBy = this.prismaService.client.pipelineStage.groupBy;

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
