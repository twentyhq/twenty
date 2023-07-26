import { Injectable } from '@nestjs/common';

import { Company } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';
import peopleSeed from 'src/core/person/seed-data/people.json';

@Injectable()
export class PersonService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.person.findFirst;
  findFirstOrThrow = this.prismaService.client.person.findFirstOrThrow;

  findUnique = this.prismaService.client.person.findUnique;
  findUniqueOrThrow = this.prismaService.client.person.findUniqueOrThrow;

  findMany = this.prismaService.client.person.findMany;

  // Create
  create = this.prismaService.client.person.create;
  createMany = this.prismaService.client.person.createMany;

  // Update
  update = this.prismaService.client.person.update;
  upsert = this.prismaService.client.person.upsert;
  updateMany = this.prismaService.client.person.updateMany;

  // Delete
  delete = this.prismaService.client.person.delete;
  deleteMany = this.prismaService.client.person.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.person.aggregate;

  // Count
  count = this.prismaService.client.person.count;

  // GroupBy
  groupBy = this.prismaService.client.person.groupBy;
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
