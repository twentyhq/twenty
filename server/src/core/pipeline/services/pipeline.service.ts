import { Injectable } from '@nestjs/common';

import { PipelineProgressableType } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';
import seedSalesPipeline from 'src/core/pipeline/seed-data/sales-pipeline.json';

@Injectable()
export class PipelineService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.pipeline.findFirst;
  findFirstOrThrow = this.prismaService.client.pipeline.findFirstOrThrow;

  findUnique = this.prismaService.client.pipeline.findUnique;
  findUniqueOrThrow = this.prismaService.client.pipeline.findUniqueOrThrow;

  findMany = this.prismaService.client.pipeline.findMany;

  // Create
  create = this.prismaService.client.pipeline.create;
  createMany = this.prismaService.client.pipeline.createMany;

  // Update
  update = this.prismaService.client.pipeline.update;
  upsert = this.prismaService.client.pipeline.upsert;
  updateMany = this.prismaService.client.pipeline.updateMany;

  // Delete
  delete = this.prismaService.client.pipeline.delete;
  deleteMany = this.prismaService.client.pipeline.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.pipeline.aggregate;

  // Count
  count = this.prismaService.client.pipeline.count;

  // GroupBy
  groupBy = this.prismaService.client.pipeline.groupBy;

  // Customs
  async createDefaultPipeline({ workspaceId }: { workspaceId: string }) {
    const pipeline = {
      ...seedSalesPipeline,
      pipelineProgressableType:
        seedSalesPipeline.pipelineProgressableType as PipelineProgressableType,
      workspaceId,
    };

    return this.create({
      data: pipeline,
    });
  }
}
