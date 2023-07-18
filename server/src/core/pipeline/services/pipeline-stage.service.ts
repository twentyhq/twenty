import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

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
    return this.createMany({
      data: [
        {
          name: 'New',
          color: '#B76796',
          index: 0,
          type: 'open',
          pipelineId,
          workspaceId,
        },
        {
          name: 'Screening',
          color: '#CB912F',
          index: 1,
          type: 'ongoing',
          pipelineId,
          workspaceId,
        },
        {
          name: 'Meeting',
          color: '#9065B0',
          index: 2,
          type: 'ongoing',
          pipelineId,
          workspaceId,
        },
        {
          name: 'Proposal',
          color: '#337EA9',
          index: 3,
          type: 'ongoing',
          pipelineId,
          workspaceId,
        },
        {
          name: 'Customer',
          color: '#079039',
          index: 4,
          type: 'won',
          pipelineId,
          workspaceId,
        },
      ],
    });
  }
}
