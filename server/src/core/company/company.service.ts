import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';
import companiesSeed from 'src/core/company/seed-data/companies.json';

@Injectable()
export class CompanyService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.company.findFirst;
  findFirstOrThrow = this.prismaService.client.company.findFirstOrThrow;

  findUnique = this.prismaService.client.company.findUnique;
  findUniqueOrThrow = this.prismaService.client.company.findUniqueOrThrow;

  findMany = this.prismaService.client.company.findMany;

  // Create
  create = this.prismaService.client.company.create;
  createMany = this.prismaService.client.company.createMany;

  // Update
  update = this.prismaService.client.company.update;
  upsert = this.prismaService.client.company.upsert;
  updateMany = this.prismaService.client.company.updateMany;

  // Delete
  delete = this.prismaService.client.company.delete;
  deleteMany = this.prismaService.client.company.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.company.aggregate;

  // Count
  count = this.prismaService.client.company.count;

  // GroupBy
  groupBy = this.prismaService.client.company.groupBy;
  async createDefaultCompanies({ workspaceId }: { workspaceId: string }) {
    const companies = companiesSeed.map((company) => ({
      ...company,
      workspaceId,
    }));
    await this.createMany({
      data: companies,
    });

    return this.findMany({ where: { workspaceId } });
  }
}
