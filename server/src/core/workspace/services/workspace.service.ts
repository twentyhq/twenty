import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { PipelineService } from 'src/core/pipeline/services/pipeline.service';
import { PrismaService } from 'src/database/prisma.service';
import { CompanyService } from 'src/core/company/company.service';
import { PersonService } from 'src/core/person/person.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pipelineService: PipelineService,
    private readonly companyService: CompanyService,
    private readonly personService: PersonService,
    private readonly pipelineStageService: PipelineStageService,
  ) {}

  // Find
  findFirst = this.prismaService.client.workspace.findFirst;
  findFirstOrThrow = this.prismaService.client.workspace.findFirstOrThrow;

  findUnique = this.prismaService.client.workspace.findUnique;
  findUniqueOrThrow = this.prismaService.client.workspace.findUniqueOrThrow;

  findMany = this.prismaService.client.workspace.findMany;

  // Create
  create = this.prismaService.client.workspace.create;
  createMany = this.prismaService.client.workspace.createMany;

  // Update
  update = this.prismaService.client.workspace.update;
  upsert = this.prismaService.client.workspace.upsert;
  updateMany = this.prismaService.client.workspace.updateMany;

  // Delete
  delete = this.prismaService.client.workspace.delete;
  deleteMany = this.prismaService.client.workspace.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.workspace.aggregate;

  // Count
  count = this.prismaService.client.workspace.count;

  // GroupBy
  groupBy = this.prismaService.client.workspace.groupBy;

  // Customs
  async createDefaultWorkspace() {
    const workspace = await this.create({
      data: {
        inviteHash: v4(),
      },
    });

    // Create default companies
    const companies = await this.companyService.createDefaultCompanies({
      workspaceId: workspace.id,
    });

    // Create default people
    await this.personService.createDefaultPeople({
      workspaceId: workspace.id,
      companies,
    });

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
