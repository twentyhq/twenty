import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PipelineProgressService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.pipelineProgress.findFirst;
  findFirstOrThrow =
    this.prismaService.client.pipelineProgress.findFirstOrThrow;

  findUnique = this.prismaService.client.pipelineProgress.findUnique;
  findUniqueOrThrow =
    this.prismaService.client.pipelineProgress.findUniqueOrThrow;

  findMany = this.prismaService.client.pipelineProgress.findMany;

  // Create
  create = this.prismaService.client.pipelineProgress.create;
  createMany = this.prismaService.client.pipelineProgress.createMany;

  // Update
  update = this.prismaService.client.pipelineProgress.update;
  upsert = this.prismaService.client.pipelineProgress.upsert;
  updateMany = this.prismaService.client.pipelineProgress.updateMany;

  // Delete
  delete = this.prismaService.client.pipelineProgress.delete;
  deleteMany = this.prismaService.client.pipelineProgress.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.pipelineProgress.aggregate;

  // Count
  count = this.prismaService.client.pipelineProgress.count;

  // GroupBy
  groupBy = this.prismaService.client.pipelineProgress.groupBy;
}
