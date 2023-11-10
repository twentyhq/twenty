import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { v4 } from 'uuid';

import { CompanyService } from 'src/core/company/company.service';
import { PersonService } from 'src/core/person/person.service';
import { PipelineProgressService } from 'src/core/pipeline/services/pipeline-progress.service';
import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { PipelineService } from 'src/core/pipeline/services/pipeline.service';
import { PrismaService } from 'src/database/prisma.service';
import { assert } from 'src/utils/assert';
import { TenantInitialisationService } from 'src/metadata/tenant-initialisation/tenant-initialisation.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pipelineService: PipelineService,
    private readonly companyService: CompanyService,
    private readonly personService: PersonService,
    private readonly pipelineStageService: PipelineStageService,
    private readonly pipelineProgressService: PipelineProgressService,
    private readonly tenantInitialisationService: TenantInitialisationService,
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

    // Create workspace schema
    await this.tenantInitialisationService.init(workspace.id);

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

  async deleteWorkspace({
    workspaceId,
    select = { id: true },
  }: {
    workspaceId: string;
    select?: Prisma.WorkspaceSelect;
  }) {
    const workspace = await this.findUnique({
      where: { id: workspaceId },
      select,
    });
    assert(workspace, 'Workspace not found');

    const where = { workspaceId };

    const {
      workspaceMember,
      attachment,
      comment,
      activityTarget,
      activity,
      apiKey,
      favorite,
      webHook,
    } = this.prismaService.client;

    // We don't delete user or refresh tokens as they can belong to another workspace
    await this.prismaService.client.$transaction([
      this.pipelineProgressService.deleteMany({
        where,
      }),
      this.companyService.deleteMany({
        where,
      }),
      this.personService.deleteMany({
        where,
      }),
      this.pipelineStageService.deleteMany({
        where,
      }),
      this.pipelineService.deleteMany({
        where,
      }),
      workspaceMember.deleteMany({
        where,
      }),
      attachment.deleteMany({
        where,
      }),
      comment.deleteMany({
        where,
      }),
      activityTarget.deleteMany({
        where,
      }),
      activity.deleteMany({
        where,
      }),
      apiKey.deleteMany({
        where,
      }),
      favorite.deleteMany({
        where,
      }),
      webHook.deleteMany({
        where,
      }),
      this.delete({ where: { id: workspaceId } }),
    ]);

    await this.tenantInitialisationService.delete(workspaceId);

    return workspace;
  }
}
