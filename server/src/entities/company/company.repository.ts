import { Injectable } from '@nestjs/common';
import { Company, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CompanyRepository {
    constructor(private prisma: PrismaService) {}

    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.CompanyWhereUniqueInput;
        where?: Prisma.CompanyWhereInput;
        orderBy?: Prisma.CompanyOrderByWithRelationInput;
      }): Promise<Company[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.company.findMany({ skip, take, cursor, where, orderBy });
      }

    async findOne(id: string | null) {
        if (id === null) return null;
        const company = await this.prisma.company.findUnique({ where: { id } });
        return company;
      }
}
