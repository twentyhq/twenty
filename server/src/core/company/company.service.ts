import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';
import companiesSeed from 'src/core/company/seed-data/companies.json';

@Injectable()
export class CompanyService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.company.findFirst;
  findFirstOrThrow = this.prismaService.company.findFirstOrThrow;

  findUnique = this.prismaService.company.findUnique;
  findUniqueOrThrow = this.prismaService.company.findUniqueOrThrow;

  findMany = this.prismaService.company.findMany;

  // Create
  create = this.prismaService.company.create;
  createMany = this.prismaService.company.createMany;

  // Update
  update = this.prismaService.company.update;
  upsert = this.prismaService.company.upsert;
  updateMany = this.prismaService.company.updateMany;

  // Delete
  delete = this.prismaService.company.delete;
  deleteMany = this.prismaService.company.deleteMany;

  // Aggregate
  aggregate = this.prismaService.company.aggregate;

  // Count
  count = this.prismaService.company.count;

  // GroupBy
  groupBy = this.prismaService.company.groupBy;
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
