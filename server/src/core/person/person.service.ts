import { Injectable } from '@nestjs/common';

import { Company } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';
import peopleSeed from 'src/core/person/seed-data/people.json';

@Injectable()
export class PersonService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.person.findFirst;
  findFirstOrThrow = this.prismaService.person.findFirstOrThrow;

  findUnique = this.prismaService.person.findUnique;
  findUniqueOrThrow = this.prismaService.person.findUniqueOrThrow;

  findMany = this.prismaService.person.findMany;

  // Create
  create = this.prismaService.person.create;
  createMany = this.prismaService.person.createMany;

  // Update
  update = this.prismaService.person.update;
  upsert = this.prismaService.person.upsert;
  updateMany = this.prismaService.person.updateMany;

  // Delete
  delete = this.prismaService.person.delete;
  deleteMany = this.prismaService.person.deleteMany;

  // Aggregate
  aggregate = this.prismaService.person.aggregate;

  // Count
  count = this.prismaService.person.count;

  // GroupBy
  groupBy = this.prismaService.person.groupBy;
  async createDefaultPeople({
    workspaceId,
    companies,
  }: {
    workspaceId: string;
    companies: Company[];
  }) {
    const people = peopleSeed.map((person, i) => ({
      ...person,
      companyId: companies[i].id || null,
      workspaceId,
    }));
    return this.createMany({
      data: people,
    });
  }
}
