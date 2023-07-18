import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import salesPipeline from '../seed-data/sales-pipeline.json';
import { PipelineProgressableType } from '@prisma/client';

@Injectable()
export class PipelineService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.pipeline.findFirst;
  findFirstOrThrow = this.prismaService.pipeline.findFirstOrThrow;

  findUnique = this.prismaService.pipeline.findUnique;
  findUniqueOrThrow = this.prismaService.pipeline.findUniqueOrThrow;

  findMany = this.prismaService.pipeline.findMany;

  // Create
  create = this.prismaService.pipeline.create;
  createMany = this.prismaService.pipeline.createMany;

  // Update
  update = this.prismaService.pipeline.update;
  upsert = this.prismaService.pipeline.upsert;
  updateMany = this.prismaService.pipeline.updateMany;

  // Delete
  delete = this.prismaService.pipeline.delete;
  deleteMany = this.prismaService.pipeline.deleteMany;

  // Aggregate
  aggregate = this.prismaService.pipeline.aggregate;

  // Count
  count = this.prismaService.pipeline.count;

  // GroupBy
  groupBy = this.prismaService.pipeline.groupBy;

  // Customs
  async createDefaultPipeline({ workspaceId }: { workspaceId: string }) {
    const pipeline = {
      ...salesPipeline,
      pipelineProgressableType:
        salesPipeline.pipelineProgressableType as PipelineProgressableType,
      workspaceId,
    };

    return this.create({
      data: pipeline,
    });
  }
}
