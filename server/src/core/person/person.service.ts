import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

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
}
